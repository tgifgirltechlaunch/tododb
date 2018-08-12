    function sidebarToggle() {
        var x = document.getElementById("sidebar");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }

    $(document).ready(function(){
        $('#completed').on('change',function() {
            
            var currtodo = document.getElementById('todoid').value;
            var checkval = this.checked;
            
            var changes = {'completed':checkval, 'id':currtodo};
            console.log(">>> " + currtodo);  
            $.ajax({
                type: "POST",
                data: JSON.stringify(changes),
                url: "/checkcompleted",
                contentType: "application/json",
                success: function(data){ console.log("checkbox data " + data) }
            });
            
        })
                
        
    });