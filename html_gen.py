import json
import re
import base64

GITHUB_BASE = "https://github.com/pkered/AR2524-Project-Gallery/raw/master/"
VERSION = "https://design-automation.github.io/mobius-parametric-modeller-0-5-6/dashboard?file=_"
LATEST = "https://mobius.design-automation.net/dashboard?file=_"
RAW_BASE = "https://raw.githubusercontent.com/pkered/AR2524-Project-Gallery/master/"

class HtmlF:
    def __init__(self, save_path):
        self.__save_path = save_path
        self.__elements = []
    def add_ele(self, htmlele_child):
        htmlele_child.update_n_tabs(0)
        self.__elements.append(htmlele_child)
        return self
    def to_html(self):
        ret_str = "<!DOCTYPE HTML>\n<html>\n"
        for ele in self.__elements:
            ret_str += ele.to_string()
        ret_str += "</html>\n"
        with open (self.__save_path, "wt", encoding="utf-8") as html_f:
            html_f.write(ret_str)
      
class HtmlEle:
    def __init__(self, tag):
        self.__children = []
        self.__text= ""
        self.__tag = tag
        self.__n_tabs = 0
        self.__attrs = []
    def update_text(self, text):
        self.__text = text
        return self
    def update_n_tabs(self, base):
        self.__n_tabs = base + 1
        return self
    def add_child(self, htmlele_child):
        htmlele_child.update_n_tabs(self.__n_tabs)
        self.__children.append(htmlele_child)
        return self
    def extend_attr(self, attr):
        self.__attrs.extend(attr)
        return self
    def get_n_tabs(self):
        return self.__n_tabs
    def __start_tag(self):
        attr_str = ""
        for attr in self.__attrs:
            attr_str += " %s" % attr
        return "<%s%s>" % (self.__tag, attr_str)
    def __sandwich(self, str_txt):
        tabs = "\t" * self.__n_tabs
        return tabs + str_txt + "\n"
    def to_string(self):
        start_tag = self.__sandwich(self.__start_tag())
        end_tag = self.__sandwich("</%s>" % self.__tag)
        body_str = ""
        for child in self.__children:
            body_str += child.to_string()
        if self.__text != "":
            body_str += ("\t" + self.__sandwich(self.__text))
        if len(self.__children)==0:
            start_tag = re.sub("\n", "", start_tag)
            body_str = re.sub("[\n\t]", "", body_str)
            end_tag = re.sub("\t", "", end_tag)
        return start_tag + body_str + end_tag

MOB_JSON = "mob_files.json"
TITLE = "AR2524 Project Gallery"

html_obj = HtmlF("index.html")
head_obj = HtmlEle("head")
body_obj = HtmlEle("body")
html_obj.add_ele(head_obj).add_ele(body_obj)

head_obj.add_child(HtmlEle("title").update_text(TITLE))
head_obj.add_child(HtmlEle("link").extend_attr(["rel='stylesheet'", "type='text/css'","href='styles.css'"]))
head_obj.add_child(HtmlEle("script").extend_attr(["src='script.js'"]))

header_obj = HtmlEle("header")
header_obj.add_child(HtmlEle("h1").update_text("AR2524 Project Gallery"))
main_obj = HtmlEle("main")
main_article = HtmlEle("article").extend_attr(["class='main__article'"])
aside_obj = HtmlEle("aside").extend_attr(["class='aside__settings'"])
body_obj.add_child(header_obj).add_child(main_obj)
main_obj.add_child(main_article).add_child(aside_obj)

aside_nav = HtmlEle("nav")
import_grp_obj = HtmlEle("div").extend_attr(["class='import_grp'"])
aside_section = HtmlEle("section").extend_attr(["class='aside__section'"])
aside_header = HtmlEle("header").extend_attr(["class='aside__header'"])
aside_footer = HtmlEle("footer").extend_attr(["class='aside__footer'"])
aside_obj.add_child(aside_nav).add_child(aside_section)
aside_section.add_child(aside_header).add_child(aside_footer)
settings_btn = HtmlEle("div").extend_attr(["class='btn btn_settings'", "onclick='clk_settings()'"]).update_text("Settings")
aside_nav.add_child(settings_btn)
aside_header.add_child(import_grp_obj)
aside_footer.add_child(HtmlEle("span").extend_attr(["id='import__fileName'"]).update_text("No File Loaded"))

import_obj = HtmlEle("label").extend_attr(["id='import'", "class='aside__btn'"])
import_grp_obj.add_child(import_obj)
import_obj.add_child(HtmlEle("input").extend_attr(["type='file'", "id='selectFiles'", "value='Import'", "style='display: none'", "onchange='load_json()'"]))
import_obj.add_child(HtmlEle("span").update_text("&#8673; Grades"))

article_nav = HtmlEle("nav")
section_obj = HtmlEle("section").extend_attr(["class='article__section'"])
section_header = HtmlEle("header").extend_attr(["class='section__banner'"])
section_footer = HtmlEle("footer").extend_attr(["class='section__figs'"])
main_article.add_child(article_nav).add_child(section_obj)
section_obj.add_child(section_header).add_child(section_footer)

btn_grp_obj = HtmlEle("div").extend_attr(["class='btn_grp'"])
article_nav.add_child(btn_grp_obj)
all_btn = HtmlEle("div").extend_attr(["id='ALL'","onclick='filter_group(this)'","class='btn selected__grp filter__btn'"])
btn_grp_obj.add_child(all_btn)
all_btn.add_child(HtmlEle("span").update_text("ALL"))

fig_grid = HtmlEle("div").extend_attr(["class='container__figs'"])
section_footer.add_child(fig_grid)

info_container = HtmlEle("div").extend_attr(["id='info'"])
section_header.add_child(info_container)
info_container.add_child(HtmlEle("h3").extend_attr(["id='TA'"]))
sort_container = HtmlEle("div")
section_header.add_child(sort_container)
sort_drpdown = HtmlEle("select").extend_attr(["id='dropdown'", "onchange='sort_figures()'"])
basic_options = HtmlEle("optgroup").extend_attr(["label='Basic'"])
sort_container.add_child(HtmlEle("span").extend_attr(["id='sort_toggle_btn'", "onclick='toggle_asc()'"]).update_text("ASCENDING"))
sort_container.add_child(sort_drpdown)
sort_drpdown.add_child(basic_options)

basic_options.add_child(HtmlEle("option").extend_attr(["value='byName'"]).update_text("Name")) # name grade
basic_options.add_child(HtmlEle("option").extend_attr(["value='byGroup'"]).update_text("Group"))

with open(MOB_JSON, "r", encoding="utf-8") as json_f:
    mob_dict = json.load(json_f)

grp_lst = []

# 6 Jan 2021 update: A-grade project filter
names = [
    # "SHARLENE SOW YONG JUN",
    "LIM GUAN JIE OLIVER",
    "SAW TIAN AIK",
    # "ZHANG JINGHAN",
    "JASPER PHANG WEE KEAT",
    "CHUNG ZHIWEI",
    "MAK JIA JING SHAUN",
    # "NG JING HAO, ALOYSIUS",
    # "RYAN CHIAM YIAK JIN",
    "TRACY TAI",
    # "ZHOU ZHEFANG",
    "NGA ZHI YUAN",
    "TAY YU JIE",
    "NG HUEI YING",
    "ISAAC TAN HUNG",
    "LIU LINXIN",
    # "YAW JESSIE",
    "LIM SHI-YI MATTHEW",
    "NABILA FATHARANI AZKA",
    "LIM WEN JIE",
    "EVE LEE SHI",
    "IAN TAY ZHE JUN",
    "RAYNARD YU JUN KIAT",
    "SU YUNG EN",
    "LIM KUN YI JAMES",
    "CHAN SHAO KAYE",
    # "ZHOU ZIJUN",
    "DELA CRUZ JOHN ANTHONY BORLONGAN",
    "KEE CHEOW YAN",
    # "LEE YONG SOON",
    "HO JUN XUAN, BENEDICT",
    "FONG SHEAN HUI",
    # "CHEUNG KAI NING",
    "CHEN BO HAN",
    # "PE CHING YEE (PENG JINGYI)",
    # "NG JIAN YUAN",
    "CHLOE LAU JIA YEE",
    # "HONG JIT SEAN BRANDON",
    "GERRELL CHEE YI LUN",
]

for f_name in mob_dict:
    proj_dict = mob_dict[f_name]

    # A-grade filter
    if proj_dict["student_name"] not in names:
        continue

    # link_str = RAW_BASE + re.sub("\s", "%20", re.sub(r"\\", "%2F", proj_dict["mob_path"]))
    link_str = RAW_BASE + re.sub("\s", "%20", re.sub(r"\\", "/", proj_dict["mob_path"]))
    mob_src = VERSION + base64.b64encode(link_str.encode("utf-8")).decode("utf-8")
    # img_src = GITHUB_BASE + re.sub("\s", "%20", re.sub(r"\\", "/", proj_dict["img_path"]))
    img_src = re.sub(r"\\", "/", proj_dict["img_path"])
    group = proj_dict["group"]
    run_time = proj_dict["run_time"]

    run_status = "fast"
    if run_time == -1:
        run_status = "error"
    if run_time > 10:
        run_status = "medium"
    if run_time > 30:
        run_status = "slow"

    if group not in grp_lst:
        grp_lst.append(group)
        group_number = re.search("\d",group).group(0)
        btn_obj = HtmlEle("div").extend_attr(["id='G%s_fbtn'" % group_number,"onclick='filter_group(this)'", "class='btn filter__btn'"])
        btn_grp_obj.add_child(btn_obj)
        btn_obj.add_child(HtmlEle("span").update_text("G%s" % group_number))
    
    figure_obj = HtmlEle("figure").extend_attr(["id='%s'" % proj_dict["student_id"], "style='display: none'"]) 
    fig_grid.add_child(figure_obj)
    figure_obj.extend_attr(["class='%s'" % run_status]).extend_attr(["data-name = '%s'" % proj_dict["student_name"], "data-group = 'G%s'" % group_number])
    run_time_div = HtmlEle("label").extend_attr(["class='%s'" % run_status])
    img_link = HtmlEle("a").extend_attr(["href='%s'" % mob_src, "target=_blank"])

    figure_obj.add_child(run_time_div)
    figure_obj.add_child(img_link)

    run_time_div.add_child(HtmlEle("span").update_text(run_status))
    run_time_div.add_child(HtmlEle("span").extend_attr(["id=%s_bdwn" % proj_dict["student_id"], "class='breakdown'"]))

    img_link.add_child(HtmlEle("img").extend_attr(["src='%s'" % img_src]))
    fig_cap_obj = HtmlEle("figcaption")
    figure_obj.add_child(fig_cap_obj)
    fig_cap_obj.add_child(HtmlEle("span").update_text("G%s %s" % (group_number, proj_dict["student_name"])))

html_obj.to_html()