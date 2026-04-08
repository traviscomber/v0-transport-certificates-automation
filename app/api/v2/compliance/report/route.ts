import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transporterId = searchParams.get("transporterId");
    const format = searchParams.get("format") || "json"; // json o csv

    if (!transporterId) {
      return NextResponse.json(
        { error: "Transporter ID required" },
        { status: 400 }
      );
    }

    // Get all documents with types
    const { data: documents } = await supabase
      .from("uploaded_documents")
      .select(
        `
        id,
        document_type_id,
        validation_status,
        confidence_score,
        expiration_date,
        created_at,
        validated_at,
        extracted_data,
        document_types(code, name, category, required_fields)
      `
      )
      .eq("transporter_id", transporterId)
      .order("created_at", { ascending: false });

    // Group by category
    const reportData = {};
    documents?.forEach((doc) => {
      const category = doc.document_types?.category;
      if (!reportData[category]) {
        reportData[category] = [];
      }
      reportData[category].push({
        code: doc.document_types?.code,
        name: doc.document_types?.name,
        status: doc.validation_status,
        confidence: doc.confidence_score,
        expiration_date: doc.expiration_date,
        uploaded_date: doc.created_at,
        validated_date: doc.validated_at,
        fields_extracted: Object.keys(doc.extracted_data || {}),
        required_fields: doc.document_types?.required_fields,
      });
    });

    if (format === "csv") {
      // Generate CSV report
      let csv = "REPORTE DE CUMPLIMIENTO DOCUMENTAL - WALMART CHILE\n";
      csv += `Transportista ID: ${transporterId}\n`;
      csv += `Fecha de Reporte: ${new Date().toLocaleDateString("es-CL")}\n\n`;

      csv += "CATEGORÍA,DOCUMENTO,ESTADO,CONFIANZA,VENCIMIENTO,FECHA CARGA,VALIDADO\n";

      documents?.forEach((doc) => {
        csv += `${doc.document_types?.category},${doc.document_types?.code},${doc.validation_status},${doc.confidence_score.toFixed(2)},${
          doc.expiration_date || "N/A"
        },${new Date(doc.created_at).toLocaleDateString("es-CL")},${
          doc.validated_at
            ? new Date(doc.validated_at).toLocaleDateString("es-CL")
            : "N/A"
        }\n`;
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=reporte_compliance_${transporterId}.csv`,
        },
      });
    }

    // Calculate summary statistics
    const totalDocs = documents?.length || 0;
    const validatedDocs = documents?.filter(
      (d) => d.validation_status === "validated"
    ).length || 0;
    const expiredDocs = documents?.filter((d) => {
      if (!d.expiration_date) return false;
      return new Date(d.expiration_date) < new Date();
    }).length || 0;
    const avgConfidence =
      totalDocs > 0
        ? (
            documents
              ?.reduce((sum, d) => sum + d.confidence_score, 0) / totalDocs
          ).toFixed(2)
        : 0;

    return NextResponse.json({
      success: true,
      report: {
        generated_at: new Date().toISOString(),
        transporter_id: transporterId,
        summary: {
          total_documents: totalDocs,
          validated_documents: validatedDocs,
          pending_documents: totalDocs - validatedDocs,
          expired_documents: expiredDocs,
          validation_rate: totalDocs > 0 ? `${Math.round((validatedDocs / totalDocs) * 100)}%` : "0%",
          average_confidence: parseFloat(avgConfidence),
        },
        by_category: reportData,
        requirements: {
          required_categories: [
            "empresa",
            "conductor",
            "vehiculo",
            "seguridad",
            "operacional",
            "subcontratacion",
          ],
          fulfilled: Object.keys(reportData),
        },
      },
    });
  } catch (error) {
    console.error("Error generating compliance report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
