import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = "https://gcrmfajlebshvohmbfuy.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseKey) {
  console.error("SUPABASE_SERVICE_KEY environment variable is required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadAllConductores() {
  try {
    // Read the CSV file
    const csvPath = path.join(
      process.cwd(),
      "user_read_only_context/text_attachments/pasted-text-Raf97.txt"
    );

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter((line) => line.trim());

    // Parse CSV (skip header)
    const conductores = [];
    const transportistasSet = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse TSV/CSV format
      const parts = line.split("\t");
      if (parts.length < 4) continue;

      const rutConductor = parts[0]?.trim();
      const nombreConductor = parts[1]?.trim();
      const rutProveedor = parts[2]?.trim();
      const nombreProveedor = parts[3]?.trim();

      if (rutConductor && nombreConductor && rutProveedor) {
        conductores.push({
          rut: rutConductor,
          nombres: nombreConductor.split(" ")[0] || nombreConductor,
          apellido_paterno:
            nombreConductor.split(" ").slice(1).join(" ") || "",
          rut_proveedor: rutProveedor,
          proveedor: nombreProveedor,
        });

        transportistasSet.add(rutProveedor.toLowerCase());
      }
    }

    console.log(`[v0] Found ${conductores.length} conductores`);
    console.log(`[v0] Found ${transportistasSet.size} unique rut_proveedor`);

    // Get existing transportistas
    const { data: existingTransportistas, error: transportistaError } =
      await supabase
        .from("transportistas")
        .select("rut")
        .limit(5000);

    if (transportistaError) {
      console.error("Error fetching transportistas:", transportistaError);
      return;
    }

    const existingRuts = new Set(
      (existingTransportistas || []).map((t: any) =>
        t.rut.toLowerCase()
      )
    );

    console.log(`[v0] Found ${existingRuts.size} existing transportistas`);

    // Find missing transportistas
    const missingTransportistas = Array.from(transportistasSet).filter(
      (rut) => !existingRuts.has(rut.toLowerCase())
    );

    console.log(
      `[v0] Missing ${missingTransportistas.length} transportistas`
    );

    // Load conductores with their transportista_id
    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < conductores.length; i += batchSize) {
      const batch = conductores.slice(i, i + batchSize);

      // Get the transportista_id for each conductor
      const conductoresToInsert = [];
      for (const conductor of batch) {
        // Find the transportista_id for this rut_proveedor
        const { data: transportista, error: tError } = await supabase
          .from("transportistas")
          .select("id")
          .eq("rut", conductor.rut_proveedor)
          .single();

        if (transportista && transportista.id) {
          conductoresToInsert.push({
            ...conductor,
            transportista_id: transportista.id,
            is_active: true,
          });
        } else {
          console.warn(
            `[v0] Transportista not found for rut_proveedor: ${conductor.rut_proveedor}`
          );
        }
      }

      if (conductoresToInsert.length > 0) {
        const { error } = await supabase
          .from("conductores")
          .insert(conductoresToInsert)
          .select();

        if (error) {
          console.error(
            `[v0] Error inserting batch ${i / batchSize + 1}:`,
            error.message
          );
          errorCount += conductoresToInsert.length;
        } else {
          successCount += conductoresToInsert.length;
          console.log(
            `[v0] Inserted batch ${i / batchSize + 1} (${successCount}/${conductores.length})`
          );
        }
      }
    }

    console.log(
      `[v0] Load complete: ${successCount} inserted, ${errorCount} failed`
    );

    // Final count
    const { data: finalCount } = await supabase
      .from("conductores")
      .select("id", { count: "exact", head: true });

    console.log(`[v0] Total conductores in database: ${finalCount?.length || 0}`);
  } catch (error) {
    console.error("[v0] Error:", error);
  }
}

loadAllConductores();
