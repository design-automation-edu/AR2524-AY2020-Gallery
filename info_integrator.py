import json
import re

with open ("mob_files.json", "rt", encoding="utf-8") as json_f:
    proj_dict = json.load(json_f)
with open ("ID_grade.json", "rt", encoding="utf-8") as json_f:
    id_gr_dict = json.load(json_f)
with open ("NET_grade.json", "rt", encoding="utf-8") as json_f:
    net_gr_dict = json.load(json_f)

for proj in proj_dict:
    proj_sub = re.sub("[^A-Za-z0-9]+", "_", proj.upper())
    stud_id = re.search("([AE][A-Z0-9]+)_?",proj_sub).group(1)
    if stud_id[0] == "E":
        stud_id = net_gr_dict[stud_id]["STUDENT NUMBER"]
    student_name = id_gr_dict[stud_id]["STUDENT NAME"]
    proj_dict[proj]["student_name"] = student_name
    proj_dict[proj]["student_id"] = stud_id

with open ("mob_files.json", "wt", encoding="utf-8") as json_f:
    json.dump(proj_dict, json_f, ensure_ascii=False, indent=4)