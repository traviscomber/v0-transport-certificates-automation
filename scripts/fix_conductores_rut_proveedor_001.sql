-- Fix conductor-transportista mappings
-- Update all conductores to their correct transportista_id based on Rut_Proveedor

-- First, let's create a mapping of Rut_Proveedor to transportista_id
-- Then update conductores with correct assignments

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77653071-9'
) WHERE c.rut IN ('18012757-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76461213-2'
) WHERE c.rut IN ('10907750-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76956797-6'
) WHERE c.rut IN ('12879880-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '16181677-9'
) WHERE c.rut IN ('16181677-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76463195-1'
) WHERE c.rut IN ('12481902-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78101236-K'
) WHERE c.rut IN ('13277753-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78032949-1'
) WHERE c.rut IN ('8825579-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77243323-9'
) WHERE c.rut IN ('7486285-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '12671737-7'
) WHERE c.rut IN ('12671737-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77083269-1'
) WHERE c.rut IN ('17461633-7', '9875518-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77150766-2'
) WHERE c.rut IN ('12457226-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78234684-9'
) WHERE c.rut IN ('26953476-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '7321424-6'
) WHERE c.rut IN ('7321424-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78154645-3'
) WHERE c.rut IN ('14621104-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76260962-2'
) WHERE c.rut IN ('11607612-8', '7012984-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77590685-5'
) WHERE c.rut IN ('13138612-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76901231-1'
) WHERE c.rut IN ('16193591-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78174616-9'
) WHERE c.rut IN ('17512443-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77058007-2'
) WHERE c.rut IN ('11838643-4', '11990292-4', '10071434-5', '12472735-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76494991-9'
) WHERE c.rut IN ('10242490-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77536347-9'
) WHERE c.rut IN ('10147115-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '7092038-7'
) WHERE c.rut IN ('7092038-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78190172-5'
) WHERE c.rut IN ('15947526-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77929313-0'
) WHERE c.rut IN ('11185990-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78040304-7'
) WHERE c.rut IN ('17690903-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77548896-4'
) WHERE c.rut IN ('17449523-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77115061-6'
) WHERE c.rut IN ('13835882-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76685344-7'
) WHERE c.rut IN ('6639764-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77390218-6'
) WHERE c.rut IN ('10573425-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77007552-1'
) WHERE c.rut IN ('12995031-5', '13353956-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76285729-4'
) WHERE c.rut IN ('18748311-5', '9744124-3', '19428444-6', '12676471-5', '7919871-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78029819-7'
) WHERE c.rut IN ('15533220-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76491308-6'
) WHERE c.rut IN ('6388956-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76447559-3'
) WHERE c.rut IN ('11434690-K', '19548402-3', '9795683-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78101306-4'
) WHERE c.rut IN ('19733547-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77416162-7'
) WHERE c.rut IN ('18364099-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76878075-7'
) WHERE c.rut IN ('19022717-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76848886-K'
) WHERE c.rut IN ('13465548-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78350942-3'
) WHERE c.rut IN ('14126191-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77441798-2'
) WHERE c.rut IN ('10529089-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76819041-0'
) WHERE c.rut IN ('16747931-6', '18662721-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77143848-2'
) WHERE c.rut IN ('16669891-K', '14154431-4', '13049990-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77772051-1'
) WHERE c.rut IN ('17590791-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77085832-1'
) WHERE c.rut IN ('15401975-8', '14285398-1', '13465290-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76303728-2'
) WHERE c.rut IN ('9271706-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76902431-K'
) WHERE c.rut IN ('10866252-2', '14445738-2', '11947260-1', '13152123-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77856341-K'
) WHERE c.rut IN ('13269446-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78150214-6'
) WHERE c.rut IN ('11966473-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78099101-1'
) WHERE c.rut IN ('19723478-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77502623-5'
) WHERE c.rut IN ('11618935-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77941769-7'
) WHERE c.rut IN ('18617130-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78001651-5'
) WHERE c.rut IN ('17610706-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78099333-2'
) WHERE c.rut IN ('11665170-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77709716-4'
) WHERE c.rut IN ('26599183-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77505286-4'
) WHERE c.rut IN ('19851132-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77496396-0'
) WHERE c.rut IN ('11567390-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78208706-1'
) WHERE c.rut IN ('12083320-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77642747-0'
) WHERE c.rut IN ('17853819-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77920451-0'
) WHERE c.rut IN ('16515307-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76851961-7'
) WHERE c.rut IN ('15169825-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78156059-6'
) WHERE c.rut IN ('22518660-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77863057-5'
) WHERE c.rut IN ('7445306-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77844986-2'
) WHERE c.rut IN ('27704167-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77742801-2'
) WHERE c.rut IN ('10511943-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77941272-5'
) WHERE c.rut IN ('18348389-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78365117-3'
) WHERE c.rut IN ('8769209-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77204205-1'
) WHERE c.rut IN ('23642784-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76390125-4'
) WHERE c.rut IN ('7954905-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77624057-5'
) WHERE c.rut IN ('18388473-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77974457-4'
) WHERE c.rut IN ('17381973-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78043729-4'
) WHERE c.rut IN ('26942243-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77560099-3'
) WHERE c.rut IN ('17352242-8', '15713508-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77420673-6'
) WHERE c.rut IN ('11971405-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78310166-1'
) WHERE c.rut IN ('17109499-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78151772-0'
) WHERE c.rut IN ('16585579-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78032375-2'
) WHERE c.rut IN ('20016670-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78350787-0'
) WHERE c.rut IN ('16114446-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78099193-3'
) WHERE c.rut IN ('18345406-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77647991-8'
) WHERE c.rut IN ('19347747-K', '16443919-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77625968-3'
) WHERE c.rut IN ('17794905-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77664223-1'
) WHERE c.rut IN ('15701835-3', '24334657-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77374557-9'
) WHERE c.rut IN ('9348715-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77890332-6'
) WHERE c.rut IN ('14682246-0', '15790079-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77492287-3'
) WHERE c.rut IN ('25477804-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76826483-K'
) WHERE c.rut IN ('7479565-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77435776-9'
) WHERE c.rut IN ('15201366-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78129079-3'
) WHERE c.rut IN ('13131472-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78132030-7'
) WHERE c.rut IN ('13498752-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77373865-3'
) WHERE c.rut IN ('11412638-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77724297-0'
) WHERE c.rut IN ('18497643-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77656577-6'
) WHERE c.rut IN ('13665163-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77225235-8'
) WHERE c.rut IN ('9380195-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77489241-9'
) WHERE c.rut IN ('16125137-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77943651-9'
) WHERE c.rut IN ('16568610-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78180641-2'
) WHERE c.rut IN ('10583929-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77927983-9'
) WHERE c.rut IN ('14343223-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77569357-6'
) WHERE c.rut IN ('20125037-4', '19533779-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77965304-8'
) WHERE c.rut IN ('12369186-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76518447-9'
) WHERE c.rut IN ('22504079-6', '18537453-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76987117-9'
) WHERE c.rut IN ('22451330-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77827992-4'
) WHERE c.rut IN ('16274214-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77401369-5'
) WHERE c.rut IN ('9957590-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78364854-7'
) WHERE c.rut IN ('18653683-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77443906-4'
) WHERE c.rut IN ('16572863-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77490988-5'
) WHERE c.rut IN ('16973068-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77411735-0'
) WHERE c.rut IN ('18000462-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76977185-9'
) WHERE c.rut IN ('8596994-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77808136-9'
) WHERE c.rut IN ('17925492-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77377507-9'
) WHERE c.rut IN ('9802602-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77852371-K'
) WHERE c.rut IN ('14094120-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78089406-7'
) WHERE c.rut IN ('16186315-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77849029-3'
) WHERE c.rut IN ('18633909-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77401233-8'
) WHERE c.rut IN ('15931343-3', '16667244-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77822803-3'
) WHERE c.rut IN ('15633374-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77375352-0'
) WHERE c.rut IN ('12785037-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76994334-K'
) WHERE c.rut IN ('14159332-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77032978-7'
) WHERE c.rut IN ('11271462-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77919212-1'
) WHERE c.rut IN ('18877641-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78027318-6'
) WHERE c.rut IN ('16670983-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78273793-7'
) WHERE c.rut IN ('18537552-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76904819-7'
) WHERE c.rut IN ('8515118-5', '12627398-3', '17143468-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77400529-3'
) WHERE c.rut IN ('10516965-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76748766-5'
) WHERE c.rut IN ('16492697-4', '13568803-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78261292-1'
) WHERE c.rut IN ('18525551-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78100599-1'
) WHERE c.rut IN ('12967316-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77349385-5'
) WHERE c.rut IN ('15148994-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78179126-1'
) WHERE c.rut IN ('17231344-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77624569-0'
) WHERE c.rut IN ('12920772-8', '17393582-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77941312-8'
) WHERE c.rut IN ('19371373-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77499811-K'
) WHERE c.rut IN ('12022695-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77495891-6'
) WHERE c.rut IN ('11801151-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78283626-9'
) WHERE c.rut IN ('18316251-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78244173-6'
) WHERE c.rut IN ('18011702-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76304483-1'
) WHERE c.rut IN ('9778154-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77377829-9'
) WHERE c.rut IN ('11534975-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76842089-0'
) WHERE c.rut IN ('18342814-4', '10254247-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78057959-5'
) WHERE c.rut IN ('12794947-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78165268-7'
) WHERE c.rut IN ('24118167-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77503624-9'
) WHERE c.rut IN ('17041135-8', '18144334-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77848908-2'
) WHERE c.rut IN ('11836287-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77992492-0'
) WHERE c.rut IN ('12393328-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76808332-0'
) WHERE c.rut IN ('15838826-K', '8163261-8', '10631473-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76903711-K'
) WHERE c.rut IN ('8662822-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77949497-7'
) WHERE c.rut IN ('6947243-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78351383-8'
) WHERE c.rut IN ('9921513-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78295206-4'
) WHERE c.rut IN ('19422493-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76507104-6'
) WHERE c.rut IN ('16262510-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77381623-9'
) WHERE c.rut IN ('12141459-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77488785-7'
) WHERE c.rut IN ('17979506-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77113814-4'
) WHERE c.rut IN ('18960151-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77913183-1'
) WHERE c.rut IN ('19241866-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77382964-0'
) WHERE c.rut IN ('10190528-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78255926-5'
) WHERE c.rut IN ('12097721-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78301223-5'
) WHERE c.rut IN ('11963927-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76812672-0'
) WHERE c.rut IN ('14145864-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77889348-7'
) WHERE c.rut IN ('16285933-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78178719-1'
) WHERE c.rut IN ('21935683-8', '16536523-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77389829-4'
) WHERE c.rut IN ('9770990-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77222214-9'
) WHERE c.rut IN ('17168357-2', '13839392-5', '26148843-4', '10356240-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78165845-6'
) WHERE c.rut IN ('11363580-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78069053-4'
) WHERE c.rut IN ('16121156-7', '12271447-0', '15107209-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77732652-K'
) WHERE c.rut IN ('8468759-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77672752-0'
) WHERE c.rut IN ('17331983-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78113086-9'
) WHERE c.rut IN ('10697923-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77566202-6'
) WHERE c.rut IN ('17937608-3', '15398705-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77408422-3'
) WHERE c.rut IN ('15868246-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77531127-4'
) WHERE c.rut IN ('19562294-9', '19026207-3', '20532359-7', '18530382-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77547318-5'
) WHERE c.rut IN ('10842565-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77998655-1'
) WHERE c.rut IN ('27446096-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78125401-0'
) WHERE c.rut IN ('10286272-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78242685-0'
) WHERE c.rut IN ('16146554-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78003531-5'
) WHERE c.rut IN ('15493907-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77896328-0'
) WHERE c.rut IN ('17338237-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77480102-2'
) WHERE c.rut IN ('17166009-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76891488-5'
) WHERE c.rut IN ('16117345-2', '9807595-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77417801-5'
) WHERE c.rut IN ('25598621-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78157982-3'
) WHERE c.rut IN ('14046644-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77392988-2'
) WHERE c.rut IN ('9407328-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77377291-6'
) WHERE c.rut IN ('9659299-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78295014-2'
) WHERE c.rut IN ('27364850-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78310280-3'
) WHERE c.rut IN ('18592248-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77986483-9'
) WHERE c.rut IN ('16296370-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77387969-9'
) WHERE c.rut IN ('10891710-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76843705-K'
) WHERE c.rut IN ('12869737-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78000781-8'
) WHERE c.rut IN ('14467460-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77993482-9'
) WHERE c.rut IN ('16379465-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77805935-5'
) WHERE c.rut IN ('10813156-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77425212-6'
) WHERE c.rut IN ('9646548-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77703639-4'
) WHERE c.rut IN ('10990624-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77852474-0'
) WHERE c.rut IN ('18670406-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78232853-0'
) WHERE c.rut IN ('11114172-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78365485-7'
) WHERE c.rut IN ('22504079-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77394975-1'
) WHERE c.rut IN ('15392455-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77848888-4'
) WHERE c.rut IN ('15213567-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77287076-0'
) WHERE c.rut IN ('13401728-7', '16682420-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77692211-0'
) WHERE c.rut IN ('13839705-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77509381-1'
) WHERE c.rut IN ('17429147-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77843013-4'
) WHERE c.rut IN ('12924248-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77117558-9'
) WHERE c.rut IN ('27113827-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78087308-6'
) WHERE c.rut IN ('17102045-K');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77413603-7'
) WHERE c.rut IN ('8026404-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77119982-8'
) WHERE c.rut IN ('15957473-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77016329-3'
) WHERE c.rut IN ('12509107-5', '22329060-4', '13715309-2', '26390420-6', '8865083-2', '22027038-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78302429-2'
) WHERE c.rut IN ('18512352-9', '8189883-9', '17932540-3');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77888835-1'
) WHERE c.rut IN ('17900921-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77110277-8'
) WHERE c.rut IN ('8942372-4', '12880784-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77357401-4'
) WHERE c.rut IN ('10623289-K', '15931067-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77893331-4'
) WHERE c.rut IN ('7077324-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77640206-0'
) WHERE c.rut IN ('21836416-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77325414-1'
) WHERE c.rut IN ('18866252-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77273263-5'
) WHERE c.rut IN ('18633398-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77698453-1'
) WHERE c.rut IN ('16201301-7');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76970026-9'
) WHERE c.rut IN ('9982464-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78296208-6'
) WHERE c.rut IN ('24425491-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78259175-4'
) WHERE c.rut IN ('15954550-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77713918-5'
) WHERE c.rut IN ('17468168-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77982752-6'
) WHERE c.rut IN ('20731894-9', '20251681-5');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78303894-3'
) WHERE c.rut IN ('11142090-4');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77926368-1'
) WHERE c.rut IN ('16935590-8');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77892137-5'
) WHERE c.rut IN ('22607329-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77383694-9'
) WHERE c.rut IN ('15943194-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77436503-6'
) WHERE c.rut IN ('19034826-1');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77931594-0'
) WHERE c.rut IN ('14564017-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78115034-7'
) WHERE c.rut IN ('8461526-9');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78293071-0'
) WHERE c.rut IN ('12756249-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78207782-1'
) WHERE c.rut IN ('13773888-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77369887-2'
) WHERE c.rut IN ('20077993-2', '17217685-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '76937652-6'
) WHERE c.rut IN ('16809991-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '78019868-0'
) WHERE c.rut IN ('27132464-2');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '10534518-6'
) WHERE c.rut IN ('9609199-0');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '12044190-6'
) WHERE c.rut IN ('12044190-6');

UPDATE conductores c SET transportista_id = (
  SELECT id FROM transportistas t WHERE t.rut = '77806154-6'
) WHERE c.rut IN ('16275792-K');

SELECT COUNT(*) as total_updated, COUNT(DISTINCT transportista_id) as unique_transportistas FROM conductores;
