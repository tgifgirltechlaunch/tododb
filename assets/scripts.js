function sidebarToggle() {
    var x = document.getElementById("sidebar");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}


function chkit(tid) {
    
    // var status = encodeURI(document.getElementById('completed'+tid).checked); 
    // console.log("...... " + tid + " " + status);
    var elementname = 'completed' + tid;
    // console.log("element name " + elementname);
    
    // var checkval = status;

    var checkval = $("#"+elementname).is(':checked') ? 1 : 0;
    console.log("checkbox status " + checkval);

    // var changes = {'completed':checkval, 'id':tid};
    // console.log("changes " + changes.completed + " " + changes.id);
    // console.log("stringify " + JSON.stringify(changes));
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({'tid': tid, 'checkval': checkval}),
        url: "/checkcompleted",
        contentType: "application/json; charset=utf-8",
        success: function(data){ console.log("checkbox data " + data) }
    });
}
