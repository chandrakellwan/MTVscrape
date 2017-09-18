//get any articles if in database if there are any articles in the database then hide the text that state that there are no articles
$.getJSON("/all", function (data) {
    // Call our function to generate a table body
    if (data != 0) {
        $("#noArticles").hide();
        //displayScrapedArticles(data);
        console.log(data);
    }
});

$("#dispalyArticles").on("click", function () {
    //ask the back end for json with all articles from the scrapedData collection
    //hide the opening text 
    $("#noArticles").hide();
    $.getJSON("/", function (data) {
        console.log(data); 
    });
});
// When user clicks the scrape button, display the table sorted by name
$("#scrapeButton").on("click", function () {
    //clearing out the table of old articles
    /*no long need this because handlebars take are of this problem.If was using a for loop to loop though our data then we will need it.*/
    //$(".card-deck").empty();
    // Do an api call to the back end for json will scrape the data from the webpage 
    $.getJSON("/scrape", function () {
        console.log("Articles are scraped");
    });
});

//add comment button is clicked get notes and display this article title.
$(document).on("click", ".btn-info" ,function () {
    // Save the id from artcle picked
    var thisId = $(this).attr("data_id");
    //console.log("button click");
    //console.log(thisId);
    // Empty the notes from the note section
    $("#previousNote").empty();
    $("#currentArticleTitle").empty();
    
    // Now make an ajax call for the Artsicle
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId

    }).done(function (data) {
        console.log(data);
        //get article title in model     
        $("#currentArticleTitle").append("<h4 class='modal-title'>" + data.title + "</h4>");
        //adding the id to the save note button
        $("#saveNote").attr("data_id", data._id);
        //display notes in the modals
        displayNotes(data.note)
    });
})

//save users comments 
$(document).on("click", "#saveNote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data_id");
    //console.log(thisId);
    var userInput = $("#userComment").val();
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from note textarea
                body: userInput
            }
        })
        // With that done
        .done(function (data) {
            // Log the response
            console.log(data);
            console.log(userInput);
        });
    //empting out comment box.
    $("#userComment").val("");
})

//delete notes 
$(document).on("click", "#notes", function () {
    var thisId = $(this).attr("data-id");
    //making sure thier is an id and click is working 
    console.log(thisId);
    $.ajax({
        method: "POST",
        url: "/delete/" + thisId

    }).done(function (data) {
        //this
        console.log("note deleted");
    })
})

//function to display notes in the modal
function displayNotes(data){
            console.log(data);
    //loop to dispaly the notes in the model  
        for (var i = 0; i < data.length; i++) {
            console.log(data[i].body);
            var $commentDiv = $('<div>');
            var $noteBlock = $('<div class="card-block">');
            var $noteText = $('<blockquote class="card-blockquote">');
            var $previousComment = $('<p class="noteData">');

            //comment div
            $commentDiv.attr("id", "notes");
            $commentDiv.addClass("card card-outline-danger");
            $commentDiv.attr("data-dismiss", "modal")
            $commentDiv.attr("data-id", data[i]._id);

            //notes in database
            $previousComment.text(data[i].body);

            $noteText.append($previousComment);
            $noteBlock.append($noteText);
            $commentDiv.append($noteBlock);

            $("#previousNote").prepend($commentDiv);

        }
}
