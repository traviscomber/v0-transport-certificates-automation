import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentTypeCode = formData.get("documentType") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!documentTypeCode) {
      return NextResponse.json(
        { error: "Document type required" },
        { status: 400 }
      );
    }

    // Fetch document type from Supabase to get the prompt
    const { data: documentType, error: fetchError } = await supabase
      .from("document_types")
      .select("*")
      .eq("code", documentTypeCode)
      .single();

    if (fetchError || !documentType) {
      return NextResponse.json(
        { error: "Document type not found" },
        { status: 404 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Call OpenAI Vision API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: documentType.ai_prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error("OpenAI error:", error);
      return NextResponse.json(
        { error: "Failed to analyze document", details: error },
        { status: 500 }
      );
    }

    const result = await openaiResponse.json();
    const text = result.choices[0].message.content;

    // Parse JSON response
    let extractedData = {};
    try {
      // Clean up response
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```(json)?\s*/g, "").replace(/\s*```/g, "");
      cleanedText = cleanedText.replace(/^["']/, "").replace(/["']$/, "");
      
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }

      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "text:", text);
      extractedData = { raw_response: text };
    }

    // Validate required fields are present
    const missingFields = documentType.required_fields.filter(
      (field: string) => !(field in extractedData)
    );

    // Calculate confidence
    let confidence = 1.0;
    if (missingFields.length > 0) {
      confidence = Math.max(0.5, 1.0 - (missingFields.length * 0.2));
    }

    // Save to uploaded_documents
    const { data: uploadedDoc, error: saveError } = await supabase
      .from("uploaded_documents")
      .insert({
        document_type_id: documentType.id,
        original_filename: file.name,
        extracted_data: extractedData,
        confidence_score: confidence,
        validation_status: "pending",
        auto_detected: false,
        detection_confidence: 1.0,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json(
        { error: "Failed to save document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documentId: uploadedDoc.id,
      documentType: {
        code: documentType.code,
        name: documentType.name,
        category: documentType.category,
      },
      extractedData,
      confidence,
      missingFields,
      requiredFields: documentType.required_fields,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
