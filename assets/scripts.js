function sidebarToggle() {
    var x = document.getElementById("sidebar");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}

function changeEdit() 
{ 
    let index = document.selectfrm.selectpicker.options[document.selectfrm.selectpicker.selectedIndex].value; 
    // console.log("selection: " + index);
    var inid = index;
    
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({'inid': inid}),
        url: "/getfrmfields",
        contentType: "application/json; charset=utf-8",
        success: function(data){ 
            // console.log("frm data " + JSON.stringify(data));
            var inid = document.getElementById('todoid');
            var intodo = document.getElementById('todo');
            var innotes = document.getElementById('notes');
            var inpriority = document.getElementById(data[0].priority);
            var incat = document.getElementById(data[0].category);
            inid.value = data[0].id;
            intodo.value = data[0].todo;
            innotes.value = data[0].notes;
            inpriority.checked = true;
            incat.checked = true;
        }
    });
}


function checkPass()
{
    var pass1 = document.getElementById('inputPassword');
    var pass2 = document.getElementById('confirmPassword');
    var message = document.getElementById('error-pass');
    var goodColor = "#66cc66";
    var badColor = "#ff6666";
 	
    if(pass1.value.length > 5)
    {
        pass1.style.backgroundColor = goodColor;
        message.style.color = goodColor;
        message.innerHTML = "OK!"
    }
    else
    {
        pass1.style.backgroundColor = badColor;
        message.style.color = badColor;
        message.innerHTML = "Must be 6 or more characters!"
        return;
    }
  
    if(pass1.value == pass2.value)
    {
        pass2.style.backgroundColor = goodColor;
        message.style.color = goodColor;
        message.innerHTML = "OK!"
    }
	else
    {
        pass2.style.backgroundColor = badColor;
        message.style.color = badColor;
        message.innerHTML = " These passwords don't match"
    }

    if(pass1.value == pass2.value && pass1.value.length > 5){
        $('#submitbtn').prop('disabled', false);
    }
    else{
        $('#submitbtn').prop('disabled', true);
    }
} 


function chkit(tid) {
    
    var elementname = 'completed' + tid;

    var checkval = $("#"+elementname).is(':checked') ? 1 : 0;
    console.log("checkbox status " + checkval);

    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({'tid': tid, 'checkval': checkval}),
        url: "/checkcompleted",
        contentType: "application/json; charset=utf-8",
        success: function(data){ console.log("checkbox data " + data) }
    });
}
