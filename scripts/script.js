$(document).ready(function(){
    
    var count = 0
    var dropdownArray = [];
    var dataArray = [];
    $("#addTrackingBtn").click(function(){
            count++;
            let content = $('.content')
            let length = $('.tracking-content').length

            console.log(length);
            console.log(content);

            let tracking_content = `
            <div id="box${count}" class="tracking-wrapper col-md-6">
                <div class="tracking-content">
                    <form>
                        <label for="companyID">Company ID: </label>
                        <input type="text" id="companyID${count}" name="companyID">
                        <button type="button" onclick="" id="${count}" class="searchBtn ml-3">Search</button>
                        <img src="./ajax-loader.gif" id="loadingIcon${count}" class="loadingIcon ml-3">
                        <p></p><div id="errorMsg${count}" style='margin-left:25%'></div>
                        <p></p>

                        <label for="queueID">Queue ID: </label>
                        <select id="queueIDDropdown${count}" class="queueIDDropdown">
                        <option value='value123' selected >No Queue Selected</option>
                        </select>

                        <input type="checkbox" id="chk${count}" name="chkInactive" value="inactive" class="chkInactive ml-3" checked>
                        <label for="chkInactive"> Hide Inactive Queues </label><br>

                    </form>
                    <button type="button" class="button closeBtn" id="${count}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x"
                            viewBox="0 0 16 16">
                            <path
                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>
            </div>
            `
            //Does the order of the dropdown matter
            //->inactive then active or nah
            
            if (length == 0) {
                content.prepend(tracking_content)
            } else {
                $('.tracking-wrapper').last().after(tracking_content)
            }
            
            
            var data = "";
            
            $('.loadingIcon').hide()
            $('.searchBtn').click(function(event){
                event.stopPropagation();
                event.stopImmediatePropagation();
                let id = $(this).attr('id')
                dropdownArray[id] = "<option selected>No Queue Selected</option>";
                let checkStatus = $("#chk"+id).prop("checked")//This gets the status of the clicked item
                $('#loadingIcon'+id).show()
                
                $.ajax({
                    url:"http://localhost:8080/company/queue?company_id="+$("#companyID"+id).val(),
                    method:'GET',
                    success: function(data,status,xhr){

                        
                        if(data.length > 0){
                            dataArray[id] = data
                            for(var x = 0;x < data.length;x++){
                                if(data[x].is_active == 1){
                                    dropdownArray[id] += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                                }else if(data[x].is_active == 0 && !checkStatus){    
                                    dropdownArray[id] += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}(Inactive)</option>`;
                                }
                            }
                            $('#errorMsg'+id).html("")
                        }else{
                            $('#errorMsg'+id).html("Queue is Empty")
                        }
                        $("#queueIDDropdown"+id).html(dropdownArray[id])
                        $('#loadingIcon'+id).hide()
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {//Error Function
                        console.log(XMLHttpRequest)
                        console.log(XMLHttpRequest.responseJSON.code)
                        data = "";
                        dataArray[id] = data;
                        if(XMLHttpRequest.responseJSON.code == "INVALID_QUERY_STRING"){
                            $('#errorMsg'+id).html("Company Id is invalid")
                            alert("The company ID was invalid")
                        }else if(XMLHttpRequest.status == 500){
                            $('#errorMsg'+id).html("Server Error")
                            alert("Failed to fetch due to a Server Error")
                        }else{
                            $('#errorMsg'+id).html("Unknown Error")
                            alert("There was an Unknown Error")
                        }
                        $("#queueIDDropdown"+id).html(dropdownArray[id])
                        $('#loadingIcon'+id).hide()
                    }
                })
            })

            $(".closeBtn").click(function(){
                let id = $(this).attr('id')
                $("#box"+id).remove()
            })

            $(".queueIDDropdown").change(function(){
                let id = $(this).attr('id')
                console.log("#"+id)
                if(this.value != "No Queue Selected"){
                let duration = 3;//Change this value for the length of the array to change or smth
                let dateNow = new Date();
                let dateISOString = dateNow.toISOString().replace("Z","%2B00:00");//Z = +00:00, ask cher whether we shld change

                $("#"+id).click(function(){
                    $.ajax({
                        url:`http://localhost:8080/company/arrival_rate?queue_id=${this.value}&from=${dateISOString}&duration=${duration}`,
                        method:'GET',
                        success: function(data,status,xhr){
                            console.log(data)
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {//Error Function
                            
                        }
                    })
                })
            }
            })

            $(".chkInactive").change(function(){
                let id = $(this).attr('id')
                integerId = id.substring(id.length-1,id.length)
                data = dataArray[integerId]
                dropdownArray[integerId] = "<option selected>No Queue Selected</option>";
                if($("#"+id).prop("checked")){

                    for(var x = 0;x < data.length;x++){
                        if(data[x].is_active == 1){
                            dropdownArray[integerId] += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                        }
                    }

                }else{

                    for(var x = 0;x < data.length;x++){
                        if(data[x].is_active == 1){
                            dropdownArray[integerId] += `<option value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                        }else{
                            dropdownArray[integerId] += `<option value='${data[x].queue_id}'>${data[x].queue_id}(Inactive)</option>`
                        }
                    }

                }
                //id here is chk(number), we want the number, so we take the last character
                $("#queueIDDropdown"+integerId).html(dropdownArray[integerId])
            })
            
        })
})
// function removeTab(box){//Can we use HTML+Jquery?
//     document.getElementById(box).remove()
// }