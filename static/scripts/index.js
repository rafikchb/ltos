
$("#lognUrlBtn").on("click", function (event) {
    $.ajax({
        url: "newLink",
        type: "POST",
        data: { link: $('#lognUrl').val() },
        dataType: "json"
    }).done(function (json) {
        if (json.etat) {
            // si le lien a etait bien shortened .
            $('#shortUrl').val(json.payload) ; 
            $('#shortUrlBtn').prop('disabled',false);
            console.log(json.payload); 
        }else{
            // dire que le format du url nai pas pris en charge 
            console.log(json.payload); 
        }
    }).fail(function (xhr, status, errorThrown) {
        alert("Sorry, there was a problem!");
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
        console.dir(xhr);
    });

});
$("#shortUrlBtn").on('click', function(event){ 
    $('#shortUrl').select(); 
    document.execCommand('copy'); 
})