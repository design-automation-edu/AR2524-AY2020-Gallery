const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "To"];

const CRITERIA = ["Overall", "Coding", "Parameterisation", "Differentiation"];

const TAs = {
    G1:"CLIFTON WONG",
    G2:"MATTHEW LEE",
    G3:"ARIES YANG",
    G4:"DE QUAN",
    G5:"HUI YAO",
    G6:"MUHAMMAD SYUKRI"
};
let ALL_GRPS = Object.keys(TAs);
let asc = true;
let settings_tog = false;
const SORT_STATES = ["DESCENDING", "ASCENDING"];

function filter_group(ele) {
    const id = ele.id;
    if (id[0]=="G") {
        // document.getElementById("TA").innerHTML = "TA: " + TAs[id.substring(0,2)];
    } else {
        document.getElementById("TA").innerHTML = "";
    }
    const all_btns = document.getElementsByClassName("filter__btn");
    for (let btn_i=0; btn_i < all_btns.length; btn_i++) {
        const btn = all_btns[btn_i];
        btn.classList.remove("selected__grp");
    }
    ele.classList.add("selected__grp");
    _display_filtered();    
}

function _display_filtered() {
    const id = document.getElementsByClassName("selected__grp")[0].id;
    let filtered_grp = id.substring(0,2).replace("_","");
    const all_figs = document.getElementsByTagName("figure");

    for (let fig_i=0; fig_i < all_figs.length; fig_i++) {
        const fig = all_figs[fig_i];
        if (filtered_grp == "AL" || fig.getAttribute("data-grade") == filtered_grp || fig.getAttribute("data-group") == filtered_grp){
            fig.style.display = "block";
        } else {
            fig.style.display = "none";
        }
    }
}

function _create_grade_btns() {
    const grade_arr = Array.from(document.querySelectorAll(".grades__column__0"));
    grade_arr.slice(1,grade_arr.length - 1).forEach(function (cell) {
        const grd = cell.innerHTML;
        let new_btn = document.createElement("div");
        new_btn.setAttribute("id" , grd+'_fbtn');
        new_btn.setAttribute("onclick", "filter_group(this)");
        new_btn.className = "btn grade_btn imp_created filter__btn";
        let new_btn_span = document.createElement("span");
        new_btn_span.innerHTML = grd;
        new_btn.appendChild(new_btn_span);
        document.getElementsByClassName("btn_grp")[0].appendChild(new_btn);
    });
}

function _append_dropdown() {
    let drop_down = document.getElementById("dropdown");
    let opt_group = document.createElement("optgroup");
    opt_group.classList.add("imp_created");
    opt_group.setAttribute("label", "Grades");
    drop_down.appendChild(opt_group);
    CRITERIA.forEach(function(opt) {
        let new_opt = document.createElement("option");
        new_opt.setAttribute("value", "by" + opt);
        new_opt.innerHTML = opt;
        opt_group.appendChild(new_opt);
    });
}

function load_json() {
    let files = document.getElementById('selectFiles').files;
    const imp_file_name = document.getElementById("import__fileName")
    _clear_attributes();
    _clear_created();
    if (files.length <= 0) {
        _update_breakdown();
        imp_file_name.onmouseenter = null;
        imp_file_name.onmouseleave = null;
        imp_file_name.onclick = null;
        imp_file_name.innerHTML = "No File Loaded";
        imp_file_name.classList.remove("file__loaded__name");
        return false;
    }
    imp_file_name.classList.add("file__loaded__name");
    const file_name = files.item(0).name;
    imp_file_name.innerHTML = file_name;
    imp_file_name.onclick = function() {
        _show_notif("<b>RESET</b>", "normal");
        load_json();
    }
    imp_file_name.onmouseenter = function(e) {e.target.innerHTML = "(reset changes)"}
    imp_file_name.onmouseleave = function(e) {e.target.innerHTML = file_name}
    ALL_GRPS = ALL_GRPS.concat(GRADES)
    _append_dropdown();

    let fr = new FileReader();
    fr.onload = function(e) { 
        let im_grade_json;
        let id_keys;
        try {
            im_grade_json = JSON.parse(e.target.result);
            id_keys = Object.keys(im_grade_json["projects"]);
            grade_range = im_grade_json["G_R"];       
            for (let i=0; i<id_keys.length; i++) {
                try {
                    const student_id = id_keys[i];
                    const student = im_grade_json["projects"][id_keys[i]];
                    const student_grade = GRADES[student["GRADE"]];
                    const code_grade = student["CODING"];
                    const para_grade = student["PARAMETERISATION"];
                    const diff_grade = student["DIFFERENTIATION"];
                    const overall_grade = student["SCORE"];

                    // const grade_span = document.getElementById(student_grade+'_fbtn').children[0];
                    
                    let fig = document.getElementById(student_id)

                    fig.setAttribute("data-grade", student_grade);
                    fig.setAttribute("data-overall", overall_grade)
                    fig.setAttribute("data-coding", code_grade);
                    fig.setAttribute("data-parameterisation", para_grade);
                    fig.setAttribute("data-differentiation", diff_grade);

                    let bump_up_btn = document.createElement('label')
                    bump_up_btn.setAttribute("onclick","bump_up(this)");
                    bump_up_btn.dataset.figParent = student_id;
                    bump_up_btn.dataset.bump = "up";
                    let arrow = document.createElement("i");
                    arrow.setAttribute("class", "arrow up");
                    bump_up_btn.appendChild(arrow);
                    bump_up_btn.className = "bump imp_created";

                    let bump_down_btn = document.createElement('label')
                    bump_down_btn.setAttribute("onclick","bump_down(this)");
                    bump_down_btn.dataset.figParent = student_id;
                    bump_down_btn.dataset.bump = "down";
                    arrow = document.createElement("i");
                    arrow.setAttribute("class", "arrow down");
                    bump_down_btn.appendChild(arrow);
                    bump_down_btn.className = "bump imp_created";

                    fig.querySelector("figcaption").appendChild(bump_up_btn);
                    fig.querySelector("figcaption").appendChild(bump_down_btn);

                } catch (error) {
                    _show_notif("No submission: " + id_keys[i], "warning");
                    grade_range[2][grade_range[2].length-1] = grade_range[2][grade_range[2].length-1] -1;
                    continue
                }
            }
            _display_bumps();
            _create_table(grade_range);
        } catch (error){
            document.getElementById("import__fileName").innerHTML = "ERROR";
            _show_notif("Invalid JSON file.", "error");
            console.log(error);
        }
        _create_grade_btns();
        _update_breakdown();
    }
    fr.readAsText(files.item(0));
    imported = true;
}
function _toggle_asc() {
    const ele =  document.getElementById("sort_toggle_btn")
    asc = !asc;
    const i = asc ? 1 : 0;
    ele.innerHTML = SORT_STATES[i];
}

function toggle_asc() {
    _toggle_asc();
    sort_figures();
}

function sort_figures() {
    const ele = document.getElementById("dropdown");
    const method = "data-" + ele.options[ele.selectedIndex].text.toLowerCase();
    let all_figs = Array.from(document.getElementsByTagName("figure"));
    let container_fig = document.querySelector(".container__figs");
    _sort_figures_by(all_figs, method, asc).forEach(function(ele) {
        container_fig.appendChild(ele);
    });
    _display_bumps();
}

function _sort_figures_by(arr, meth, ascd) {
    arr.sort(function(a,b) {
        if (a.getAttribute(meth) < b.getAttribute(meth)) { return -1; }
        else if (a.getAttribute(meth) > b.getAttribute(meth)) {return 1; }
        else {return 0;}
    });
    if (ascd) {
        return arr;
    } else {
        return arr.reverse();
    }
}

function _clear_attributes() {
    let all_figs = Array.from(document.getElementsByTagName("figure"));
    all_figs.forEach(function(fig) {
        fig.setAttribute("data-grade", "U");
        fig.setAttribute("data-overall", "U")
        fig.setAttribute("data-coding", "U");
        fig.setAttribute("data-parameterisation", "U");
        fig.setAttribute("data-differentiation", "U");
    });
}

function _update_breakdown() {
    let all_figs = Array.from(document.getElementsByTagName("figure"));
    all_figs.forEach(function(fig) {
        _update_fig_breakdown(fig);
    });
}

function _update_fig_breakdown(fig) {
    let breakdown = "C:" + fig.dataset.coding + " P:" + fig.dataset.parameterisation + " D:"+ fig.dataset.differentiation;
        fig.querySelector(".breakdown").innerHTML = breakdown;
}

function _display_bumps() {
    const ele = document.getElementById("dropdown");
    const method = ele.options[ele.selectedIndex].getAttribute("value");
    let disp = "none";
    if (method == "byOverall") {
        disp = "block"
    }
    Array.from(document.getElementsByClassName("bump")).forEach(function(bump_btn) {
        bump_btn.style.display = disp;
    });
}

function _swap_attribs(ele1, ele2, attrib) {
    const store_ele1 = ele1.getAttribute(attrib);
    ele1.setAttribute(attrib, ele2.getAttribute(attrib));
    ele2.setAttribute(attrib, store_ele1);
}

function _swap_grades(fig, tar) {
    let message = _attr_to_str(fig) + " <> " + _attr_to_str(tar);
    _show_notif(message, "normal");
    const tar_overall = tar.dataset.overall;
    const fig_overall = fig.dataset.overall; 
    ["data-coding", "data-parameterisation", "data-differentiation"].forEach(function(grade_component) {
        const fig_component = fig.getAttribute(grade_component);
        const tar_component = tar.getAttribute(grade_component);
        fig.setAttribute(grade_component, round_decimal(fig_component/fig_overall * tar_overall, 1));
        tar.setAttribute(grade_component, round_decimal(tar_component/tar_overall * fig_overall, 1));
    });
    _swap_attribs(fig, tar, "data-grade");
    _swap_attribs(fig, tar, "data-overall");
    _update_fig_breakdown(fig);
    _update_fig_breakdown(tar);
}

function _attr_to_str(fig) {
    return fig.dataset.group + " " +
           fig.dataset.name + " (" +
           fig.dataset.grade + ")";
}

function bump_up(btn) {
    const fig = document.getElementById(btn.dataset.figParent);
    let target;
    try {
        target = fig.previousElementSibling;
        _swap_grades(fig, target);
        fig.parentNode.insertBefore(fig,target);
        _display_filtered();
    } catch {
        let bound_typ = "lower";
        if (!asc) {bound_typ = "upper";}
        _show_notif(bound_typ + " bound reached", "error");
    }
}

function bump_down(btn) {
    const fig = document.getElementById(btn.dataset.figParent);
    let target;
    try {
        target = fig.nextElementSibling;
        _swap_grades(fig, target);
        fig.parentNode.insertBefore(target,fig);
        _display_filtered();
    }  catch {
        let bound_typ = "lower";
        if (asc) {bound_typ = "upper";}
        _show_notif(bound_typ + " bound reached", "error");
    }
}

function _show_notif(message, error) {
    let append_front = "";
    if (error=="error" || error=="warning") {
        append_front = "<b>" + error.toUpperCase() + ": </b>";
    }
    const info_box = document.getElementById("info");
    const TA_h = document.getElementById("TA");
    TA_h.style.display = "none";
    const temp = document.createElement("span")
    temp.innerHTML = append_front + message;
    temp.className = "temp_msg";
    info_box.parentNode.classList.add(error);
    info_box.appendChild(temp);
    const _n_temps = _n_temp_exists();
    setTimeout(function() {
        temp.parentNode.removeChild(temp);
        info_box.parentNode.classList.remove(error);
        setTimeout(function() {
            if (_n_temp_exists() == 0) {
                TA_h.style.display = "block"
            }
        }, 1000);
    }, 1000 * (_n_temps+1));
}

function _n_temp_exists() {
    const arr = Array.from(document.getElementsByClassName("temp_msg"));
    return arr.length;
}

function clk_settings() {
    settings_tog = !settings_tog;
    _vis_settings();
}

function _vis_settings() {
    if (settings_tog) {
        document.querySelector(".aside__settings").style.maxWidth = "100%";
        document.querySelector(".aside__settings").style.minWidth = "20%";
        document.querySelector(".aside__section").style.display = "flex";
        document.querySelector(".main__article").style.maxWidth = "80%";
        document.querySelector("body").style.marginRight = 0;
    } else {
        document.querySelector(".aside__settings").style.maxWidth = "0";
        document.querySelector(".aside__settings").style.minWidth = "0";
        document.querySelector(".aside__section").style.display = "none";
        document.querySelector(".main__article").style.maxWidth = "100%";
        document.querySelector("body").style.marginRight = "2em";
    }
}

function _clear_created() {
    const created_eles = document.getElementsByClassName("imp_created");
    while (created_eles.length > 0) {
        created_eles[0].remove();
    }
}

function _create_table(grade_range) {
    let TBL = document.createElement("table");
    TBL.className = "table__grade imp_created"
    let TBL_COLUMNS = ["grade", "", "cut-off", "quantity"];
    let TBL_HEAD = TBL.createTHead();
    let TBL_BODY = TBL.createTBody();
    let HEADER_ROW = TBL_HEAD.insertRow(0);
    let TBL_DATA = [GRADES, grade_range[0], grade_range[1], grade_range[2]];
    for (let i=0; i<TBL_DATA[0].length + 1; i++) {
        let curr_row = HEADER_ROW;
        if (i > 0) {
            curr_row = TBL_BODY.insertRow(i-1);
        }  
        for (let j = 0; j<TBL_COLUMNS.length; j++) {
            let cell = curr_row.insertCell(j);
            let editable = false;
            if (i==0) {
                cell.innerHTML = TBL_COLUMNS[j];
                if (j > 1) {
                    cell.onclick = function() {select_column(j);}
                    cell.classList.add("header__selectable");
                }
            } else if (i == TBL_DATA[3].length + 1) {
                let ins_data = "";
                if (j==3) {
                    ins_data = _sum_arr(grade_range[2]);
                    cell.onclick = function() {re_sum()};
                    cell.setAttribute("data-maxquantity", ins_data);
                }
                cell.innerHTML = ins_data;
            } else {
                let ins_data = TBL_DATA[j][i-1];
                if (GRADES[i-1] == "C" && j!= 3) {
                    switch (j) {
                        case 1:
                            ins_data = "<"
                            break;
                        case 2:
                            ins_data = TBL_DATA[j][i-2];
                            break;
                    }
                } else {
                    if (j > 1) {
                        editable = true;
                        cell.className = "editable";
                        cell.onclick = function() {select_column(j);}
                        cell.classList.add("default__editable");
                        cell.onmouseenter = function() {document.getElementById("header_" + j).style.textDecoration = "underline";}
                        cell.onmouseleave = function() {document.getElementById("header_" + j).removeAttribute("style");}
                    }
                    if (i-1 == 6 && j==2) {
                        cell.oninput = function() {
                            document.getElementById("C_2").innerHTML = cell.innerHTML;
                        }
                    }
                }
                cell.innerHTML = ins_data;
            }
            cell.setAttribute("contenteditable", editable);
            cell.dataset.defaultedit = editable;
            let id_append = GRADES[i-1];
            if (id_append == undefined) {
                id_append = "header";
                cell.classList.add("tbl__header");
            }
            cell.id = id_append + "_" + j;
            cell.classList.add("cell");
            cell.classList.add("grades__column__" + j);
            cell.dataset.row = i-1;
            cell.dataset.col = j;
        }
    }  
    const aside_footer = document.querySelector(".aside__footer");
    aside_footer.appendChild(TBL);

    const update_fn = new GradeFunction("Update");
    const rebuild_fn = new GradeFunction("Rebuild");
    const download_fn = new GradeFunction("&#8675; Grades");
    
    update_fn.active_btn().id = "aside__update";
    update_fn.active_btn().onclick = function() {update_grade_range();}
    update_fn.append_arg(document.createElement("span"), "update_fn__desc").innerHTML = "select column";

    rebuild_fn.active_btn().id = "aside__rebuild";
    rebuild_fn.active_btn().onclick = function() {rebuild_grades();}
    rebuild_fn.append_arg(_create_input(40), "rebuild_fn__min").classList.add("aside__arg");
    rebuild_fn.append_arg(document.createElement("span"), "rebuild_fn__desc").innerHTML = "to";
    rebuild_fn.append_arg(_create_input(85), "rebuild_fn__max").classList.add("aside__arg");

    download_fn.active_btn().id = "aside__dl_json";
    download_fn.active_btn().onclick = function() {export_json();}
    download_fn.active_btn().style.margin = "auto";
    download_fn.active_btn().style.marginTop = "3em";
}

class GradeFunction {
    constructor(function_name) {
        this.__container = document.createElement("div");
        this.__active_btn = _create_btn(function_name);
        this.__arg_container = document.createElement("div");
        this.__container.appendChild(this.__active_btn);
        this.__container.appendChild(this.__arg_container);
        this.__active_btn.classList.add("aside__btn");
        this.__container.className = "grade_fn__container imp_created";
        this.__arg_container.classList.add("grade_fn__args")
        document.querySelector(".aside__footer").appendChild(this.__container);
        this.__arg_children = {};
    }
    active_btn() {
        return this.__active_btn;
    }
    arg_container() {
        return this.__arg_container;
    }
    append_arg(child_element, id) {
        child_element.id = id
        this.__arg_container.appendChild(child_element);
        this.__arg_children[id] = child_element;
        return child_element;
    }
    get_arg(id) {
        return this.__arg_children[id];
    }
    get_container() {
        return this.__container;
    }
}

function _create_input(inner_txt) {
    const ret_input = document.createElement("input");
    ret_input.value = inner_txt;
    ret_input.type = "text";
    ret_input.className = "imp_created";
    return ret_input;
}

function _create_btn(inner_span_txt) {
    const ret_btn = document.createElement("label");
    const btn_span = document.createElement("span");
    btn_span.innerHTML = inner_span_txt;
    ret_btn.appendChild(btn_span);
    ret_btn.className = "imp_created";
    return ret_btn;
}

function select_column(col_number) {
    document.getElementById("update_fn__desc").innerHTML = "by " + document.getElementById("header_" + col_number).innerHTML;
    let col_to_disable;
    switch (col_number) {
        case 2:
            col_to_disable = 3;
            break;
        case 3:
            col_to_disable = 2;
            break;
    }
    _enable_column(col_number);
    _disable_column(col_to_disable);
}

function _get_selected_column() {
    let ret =  document.querySelector(".selected__column")
    if (ret == null) {
        _show_notif("No Column Selected", "warning");
        return false;
    } else {
        return Number(ret.dataset.col);
    }
}

function _enable_column(col_number) {
    const all_col_cells = document.getElementsByClassName("cell grades__column__" + col_number);
    for (let i=0; i<all_col_cells.length; i++) {
        const cell = all_col_cells[i];
        const defaultedit = cell.dataset.defaultedit;
        cell.classList.add("selected__column");
        if (defaultedit == "true") {
            cell.classList.add("editable");
            cell.setAttribute("contenteditable", true);
        }
    }  
}

function _disable_column(col_number) {
    while(document.getElementsByClassName("editable cell grades__column__" + col_number)[0]) {
        to_d_cell = document.getElementsByClassName("editable cell grades__column__" + col_number)[0];
        to_d_cell.classList.remove("editable");
        to_d_cell.setAttribute("contenteditable", false);
        to_d_cell.classList.remove("selected__column");
    }
    const d_column_header = document.getElementById("header_" + to_d_cell.dataset.col);
    d_column_header.classList.remove("selected__column");
}

function re_sum() {
    const prev_sum = document.getElementById("To_3").innerHTML;
    const new_sum = _sum_arr(Array.from(
        document.getElementsByClassName("grades__column__3 default__editable")).map(ele => Number(ele.innerHTML))
        );
    document.getElementById("To_3").innerHTML = new_sum;
    document.getElementById("To_3").classList.remove("warning");
    _show_notif("Recomputed Total: " + prev_sum + " -> " + new_sum, "normal");
}

function _sum_arr(arr) {
    return arr.reduce((total, num) => total + num, 0);
}

function update_grade_range() {
    const quant_chk = _is_quantity_equal()
    const cutoff_chk = _is_legal_cutoff();
    if (quant_chk && cutoff_chk) {
        const selected_col = _get_selected_column();
        if (!selected_col) {return;}
        const col_header = document.getElementById("header_" + selected_col).innerHTML;
        _show_notif("<b>RULE</b>: " + col_header, "normal");
        switch (selected_col) {
            case 2:
                _update_by_cutoff();
                break;
            case 3:
                _update_by_quantity();
                break;
        }
    }
    _display_filtered();
    document.getElementById("C_2").innerHTML = document.getElementById("C+_2").innerHTML;
}

function _update_by_cutoff() {
    const qty_arr = _update_figs_grade();    
    _update_quantity(qty_arr);
}

function _update_figs_grade() {
    const qty_arr = GRADES.slice(0,GRADES.length-1).map(grade => 0);
    const all_figs = Array.from(document.getElementsByTagName("figure"));
    all_figs.forEach(function(fig) {
        const curr_grade = fig.dataset.grade;
        const new_grade_idx = _score_to_gradeIdx(fig.dataset.overall);
        qty_arr[new_grade_idx] += 1;
        const new_grade = GRADES[new_grade_idx];
        if (new_grade != curr_grade) {
            fig.dataset.grade = new_grade;
            _show_notif(fig.id + ": " + curr_grade + " -> " + new_grade);
        }
    });
    return qty_arr;
}

function _update_quantity(arr) {
    const quant_col_cells = document.querySelectorAll(".default__editable.grades__column__3");
    for (let i=0; i<arr.length; i++) {
        quant_col_cells[i].innerHTML = arr[Number(quant_col_cells[i].dataset.row)];
    }
}

function _update_by_quantity() {
    _descending_overall_sort();
    const all_figs = Array.from(document.getElementsByTagName("figure"));
    const quants_cells = Array.from(document.getElementsByClassName("grades__column__3 default__editable"));
    const quants_arr = quants_cells.slice(0,quants_cells.length-1).map(ele => Number(ele.innerHTML));
    const cutoff_arr = [];
    let prev_qty = 0;
    quants_arr.forEach(function(qty) {
        prev_qty += qty;
        cutoff_arr.push(all_figs[prev_qty-1].dataset.overall);
    });    
    _update_cutoff(cutoff_arr);
    _update_quantity(_update_figs_grade());
}

function _update_cutoff(arr) {
    const cutoff_col_cells = document.querySelectorAll(".default__editable.grades__column__2");
    for (let i=0; i<arr.length; i++) {
        cutoff_col_cells[i].innerHTML = Math.round(arr[Number(cutoff_col_cells[i].dataset.row)] * 10)/10;
    }
}

function _descending_overall_sort() {
    if (asc) {_toggle_asc();}
    document.querySelector('#dropdown [value="byOverall"]').selected = true;
    sort_figures();
}

function rebuild_grades() {
    if (!_is_legal_min_max() || !_is_legal_cutoff() || !_is_quantity_equal()) {return;}
    // alert and confirm (warning);
    if (confirm("Rebuild redistributes students based on the current ranking in the viewer. All grades will be modified.")) {
        _descending_overall_sort();
        const all_figs = Array.from(document.getElementsByTagName("figure"));
        const quants_cells = Array.from(document.getElementsByClassName("grades__column__3 default__editable"));
        const quants_arr = quants_cells.slice(0,quants_cells.length).map(ele => Number(ele.innerHTML));
        const cutoff_cells = Array.from(document.querySelectorAll(".default__editable.grades__column__2"));
        const cutoff_arr = cutoff_cells.slice(0,cutoff_cells.length).map(ele => Number(ele.innerHTML));
        
        let upp_cutoff = Number(document.getElementById("rebuild_fn__min").innerHTML);
        let lower_cutoff = 0;
        let prev_i = 0;
        for (let i=0; i<quants_arr.length; i++) {
            const qty = quants_arr[i]
            const curr_i = prev_i + qty;
            
            if (i==quants_arr.length-1) {
                lower_cutoff = Number(document.getElementById("rebuild_fn__max").innerHTML);
            } else {
                lower_cutoff = cutoff_arr[i];
            }
            const distribution_unit = (upp_cutoff - lower_cutoff)/qty;
            const curr_students = all_figs.slice(prev_i,curr_i)
            for (let j=0; j<curr_students.length; j++) {
                const student = curr_students[j];
                let student_overall = Number(student.dataset.overall);
                if (i==0) { // bump up to A+
                    student_overall = lower_cutoff; 
                } else if  (i==quants_arr.length-1) {// bump down to C
                    student_overall = upp_cutoff - distribution_unit; 
                } else { // distribution cases
                    student_overall = upp_cutoff - (j+1) * distribution_unit;
                }
                const curr_overall = Number(student.dataset.overall)
                const curr_coding = Number(student.dataset.coding);
                const curr_parameterisation = Number(student.dataset.parameterisation);
                const curr_differentiation= Number(student.dataset.differentiation);
                student.dataset.coding = round_decimal(curr_coding/curr_overall * student_overall, 1);
                student.dataset.parameterisation = round_decimal(curr_parameterisation/curr_overall * student_overall, 1);
                student.dataset.differentiation = round_decimal(curr_differentiation/curr_overall * student_overall, 1);
                student.dataset.overall = round_decimal(student_overall, 1);
                const prev_grade = student.dataset.grade;
                const new_grade = GRADES[_score_to_gradeIdx(student_overall)];
                if (prev_grade != new_grade) {
                    student.dataset.grade = new_grade;
                    _show_notif(student.id + ": " + prev_grade + " -> " + new_grade);
                }
            }
            upp_cutoff = lower_cutoff;
            prev_i = curr_i;
        }
    } else {
        return;
    }
    _update_breakdown();
    _display_filtered();
}

function _is_legal_min_max() {
    const arg_min_ele = document.getElementById("rebuild_fn__min");
    const arg_min = Number(arg_min_ele.value);
    const arg_max_ele = document.getElementById("rebuild_fn__max");
    const arg_max = Number(arg_max_ele.value);
    let ret = true;
    if (arg_min > Number(document.getElementById("C+_2").innerHTML)) {
        console.log(arg_min);
        _show_notif("specified minimum is higher than C+ cut-off", "warning");
        arg_min_ele.classList.add("warning");
        ret = false;
    }
    if (arg_max < Number(document.getElementById("A+_2").innerHTML)) {
        console.log(arg_max);
        _show_notif("specified maximum is lower than A+ cut-off", "warning");
        arg_max_ele.classList.add('warning');
        ret = false;
    }
    if (ret) {
        arg_min_ele.classList.remove("warning");
        arg_max_ele.classList.remove("warning");
    }
    return ret;
}

function round_decimal(number, places) {
    return Math.round(number*10**places)/10**places;
}

function _is_quantity_equal() {
    const check_sum = _sum_arr(Array.from(
        document.getElementsByClassName("grades__column__3 default__editable")).map(ele => Number(ele.innerHTML))
        );
    if (check_sum != Number(document.getElementById("To_3").innerHTML)) {
        _show_notif("Quantity do not sum up. Click on Total Sum to recompute", "warning");
        document.getElementById("To_3").classList.add("warning");
        return false;
    }
    const max_qty = document.getElementById("To_3").dataset.maxquantity
    if (check_sum > max_qty) {
        _show_notif("Specified quantity is larger than total submissions (" + max_qty + ")", "error");
        document.getElementById("To_3").classList.add("error");
        return false;
    }
    document.getElementById("To_3").classList.remove("warning");
    return true;
}

function _is_legal_cutoff() {
    let cut_offs = document.getElementsByClassName("grades__column__2 default__editable");
    let is_legal = true;
    for (let i=0; i<cut_offs.length; i++) {
        const cell = cut_offs[i]
        is_legal = _is_legal_cutoff_cell(cell) && is_legal;
    }
    return is_legal;
}

function _is_legal_cutoff_cell(cell) {
    const curr_val = Number(cell.innerHTML);
    const curr_row = Number(cell.dataset.row);
    if (curr_row!=6) {
        const next_val = Number(document.getElementById(GRADES[curr_row+1] + "_2").innerHTML);
        if (curr_val <= next_val) {
            _show_notif("Cut-off for " + GRADES[curr_row] + " <= " + GRADES[curr_row+1], "warning");
            cell.classList.add("warning");
            return false;
        }
    }
    if (curr_row!=0) {
        const prev_val = Number(document.getElementById(GRADES[curr_row-1] + "_2").innerHTML);
        if (curr_val >= prev_val) {
            _show_notif("Cut-off for " + GRADES[curr_row] + " >= " + GRADES[curr_row-1], "warning");
            cell.classList.add("warning");
            return false;
        }
    }
    cell.classList.remove("warning");
    return true;
}

function _score_to_gradeIdx(score) {
    const G_R = Array.from(document.querySelectorAll(".default__editable.grades__column__2")).map(cell => Number(cell.innerHTML));
    if (score >= G_R[0]) {
        return 0;
    } else if (score >= G_R[1] && score < G_R[0]) {
        return 1;
    } else if (score >= G_R[2] && score < G_R[1]) {
        return 2;
    } else if (score >= G_R[3] && score < G_R[2]) {
        return 3;
    } else if (score >= G_R[4] && score < G_R[3]) {
        return 4;
    } else if (score >= G_R[5] && score < G_R[4]) {
        return 5;
    } else if (score >= G_R[6] && score < G_R[5]) {
        return 6;
    } else {
        return 7;
    }
}

function export_json() {
    // create object data from all figures
    let export_obj = {
        G_R: [],
        projects: {}
    };
    const cut_off_data = Array.from(document.querySelectorAll(".default__editable.grades__column__2")).map(ele => Number(ele.innerHTML));
    const qty_data = Array.from(document.querySelectorAll(".default__editable.grades__column__3")).map(ele => Number(ele.innerHTML));
    const signs_data = cut_off_data.map(n => ">=");
    export_obj.G_R = [signs_data, cut_off_data, qty_data];

    let proj_obj = {};
    const all_figs = Array.from(document.getElementsByTagName("figure"));
    all_figs.forEach(function(fig) {
        const stud_obj = {}
        stud_obj.GRADE = GRADES.indexOf(fig.dataset.grade);
        stud_obj.CODING = fig.dataset.coding;
        stud_obj.PARAMETERISATION = fig.dataset.parameterisation;
        stud_obj.DIFFERENTIATION = fig.dataset.differentiation;
        stud_obj.SCORE = fig.dataset.overall;
        stud_obj["STUDENT NAME"] = fig.dataset.name;
        proj_obj[fig.id] = stud_obj;
    });

    export_obj.projects = proj_obj;

    const file_name = document.getElementById("import__fileName").innerHTML;
    const content = JSON.stringify(export_obj);
    const a = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = file_name;
    a.click();

    _show_notif("<b>File Downloaded.</b>", "normal");
}

function _is_number() {
    // for checking of editable inputs.
    console.log("not implemented");
}

window.addEventListener("load", sort_figures);
window.addEventListener("load", _display_filtered);