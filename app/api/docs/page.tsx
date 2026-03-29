export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4"></script>
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css" />
      
      <div id="swagger-ui"></div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "/api/docs/openapi",
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset
              ],
              layout: "StandaloneLayout"
            })
          }
        `
      }} />
    </div>
  )
}
