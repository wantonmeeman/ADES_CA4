$(document).ready(function(){
    
    var count = 0
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
                        <input type="text" id="companyID" name="companyID">
                        <button type="button" onclick="" id="searchBtn" class="searchBtn ml-3">Search</button>
                        <img src="./ajax-loader.gif" id="loadingIcon" class="ml-3">
                        <p></p>

                        <label for="queueID">Queue ID: </label>
                        <select id="queueIDDropdown">
                        </select>

                        <input type="checkbox" id="chkInactive" name="chkInactive" value="inactive" class="ml-3" checked>
                        <label for="chkInactive"> Hide Inactive Queues</label><br>

                    </form>
                    <button type="button" class="button closeBtn" id="deleteTrackerBtn" >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x"
                            viewBox="0 0 16 16">
                            <path
                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>
            </div>
            `
            
            if (length == 0) {
                content.prepend(tracking_content)
                //content.insertAdjacentHTML('afterbegin', tracking_content)
            } else {
                document.getElementsByClassName('tracking-wrapper')[length - 1].insertAdjacentHTML('afterend', tracking_content)
            }

            
            var dropdownArray = "";
            var data = "";
            $('#loadingIcon').hide()

            
            $('#searchBtn').click(function(){
                $('#loadingIcon').show()
                console.log('Search button Clicked')
                $.ajax({
                    url:"http://localhost:8080/company/queue?company_id="+$("#companyID").val(),
                    method:'GET',
                    success: function(data,status,xhr){
                        console.log(data)

                        for(var x = 0;x < data.length;x++){
                            if(data[x].is_active == 0){
                                dropdownArray += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                            }
                        }

                        $("#queueIDDropdown").html(dropdownArray)
                        $('#loadingIcon'+count).hide()
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {//Error Function
                        console.log(XMLHttpRequest)
                        console.log(XMLHttpRequest.responseJSON.code)

                        data = [
                            {
                                "queue_id": "QUEUE01001",
                                "is_active": 1
                            },
                            {
                                "queue_id": "QUEUE01002",
                                "is_active": 1
                            },
                            {
                                "queue_id": "QUEUE01003",
                                "is_active": 0
                            }
                        ]

                        for(var x = 0;x < data.length;x++){
                            if(data[x].is_active == 0){
                                dropdownArray += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                            }
                        }

                        $("#queueIDDropdown").html(dropdownArray)
                        $('#loadingIcon').hide()
                    }
                })

                
            })
            $("#deleteTrackerBtn").click(function(){
                $("#box").remove()
            })

            $("#chkInactive").change(function(){
                dropdownArray = "";
                console.log(data)

                if(this.checked){

                    for(var x = 0;x < data.length;x++){
                        if(data[x].is_active == 0){
                            dropdownArray += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                        }
                    }

                }else{

                    for(var x = 0;x < data.length;x++){
                        if(data[x].is_active == 0){
                            dropdownArray += `<option value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                        }else{
                            dropdownArray += `<option value='${data[x].queue_id}'>${data[x].queue_id}(Inactive)</option>`
                        }
                    }

                }
                $("#queueIDDropdown").html(dropdownArray)
            })
            
        })
});