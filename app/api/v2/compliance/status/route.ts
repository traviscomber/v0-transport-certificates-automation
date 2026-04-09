import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

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

    if (!transporterId) {
      return NextResponse.json(
        { error: "Transporter ID required" },
        { status: 400 }
      );
    }

    // Get all document types categories
    const { data: allDocumentTypes } = await supabase
      .from("document_types")
      .select("code, name, category, required_fields")
      .eq("is_active", true);

    // Get uploaded documents for transporter
    const { data: uploadedDocs } = await supabase
      .from("uploaded_documents")
      .select(
        `
        id,
        document_type_id,
        validation_status,
        expiration_date,
        created_at,
        document_types(code, name, category)
      `
      )
      .eq("transporter_id", transporterId);

    // Calculate compliance by category
    const categoryStatus = {};
    const allCategories = [
      "empresa",
      "conductor",
      "vehiculo",
      "seguridad",
      "operacional",
      "subcontratacion",
    ];

    for (const category of allCategories) {
      const docsInCategory = (allDocumentTypes || []).filter(
        (dt) => dt.category === category
      );
      const uploadedInCategory = uploadedDocs?.filter(
        (ud) => {
          const docType = Array.isArray(ud.document_types) ? ud.document_types[0] : ud.document_types;
          return docType?.category === category;
        }
      ) || [];

      const validatedInCategory = uploadedInCategory.filter(
        (ud) => ud.validation_status === "validated"
      );

      const expiredInCategory = uploadedInCategory.filter((ud) => {
        if (!ud.expiration_date) return false;
        return new Date(ud.expiration_date) < new Date();
      });

      categoryStatus[category] = {
        total_types: docsInCategory.length,
        uploaded_documents: uploadedInCategory.length,
        validated_documents: validatedInCategory.length,
        expired_documents: expiredInCategory.length,
        compliance_percentage: docsInCategory.length > 0
          ? Math.round(
              (validatedInCategory.length / docsInCategory.length) * 100
            )
          : 0,
      };
    }

    // Calculate overall compliance
    const totalDocumentTypes = allDocumentTypes?.length || 0;
    const totalUploadedDocs = uploadedDocs?.length || 0;
    const totalValidatedDocs = uploadedDocs?.filter(
      (ud) => ud.validation_status === "validated"
    ).length || 0;
    const totalExpiredDocs = uploadedDocs?.filter((ud) => {
      if (!ud.expiration_date) return false;
      return new Date(ud.expiration_date) < new Date();
    }).length || 0;

    const overallCompliance =
      totalDocumentTypes > 0
        ? Math.round((totalValidatedDocs / totalDocumentTypes) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      transporterId,
      overall_compliance: overallCompliance,
      summary: {
        total_document_types: totalDocumentTypes,
        total_uploaded: totalUploadedDocs,
        total_validated: totalValidatedDocs,
        total_expired: totalExpiredDocs,
      },
      by_category: categoryStatus,
    });
  } catch (error) {
    console.error("Error calculating compliance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
