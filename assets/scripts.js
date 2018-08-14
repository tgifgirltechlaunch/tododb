function sidebarToggle() {
    var x = document.getElementById("sidebar");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
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
