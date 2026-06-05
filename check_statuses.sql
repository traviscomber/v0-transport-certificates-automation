-- Check all validation_status values
SELECT validation_status, COUNT(*) as count 
FROM uploaded_documents 
GROUP BY validation_status;
