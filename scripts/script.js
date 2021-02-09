$(document).ready(function () {

    var count = 0
    var dropdownArray = [];
    var dataArray = [];
    var intervalArray = [];
    $("#addTrackingBtn").click(function () {
        let queue;
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

                    <div class="d-flex justify-content-center">
                        <div class="warning-wrapper" id="warning${count}">
                            <i class="warning-icon fa fa-exclamation-triangle fa-2x">
                                <span class="tooltiptext">Unable to connect to the backend server!</span>
                            </i>
                        </div>
                        <i id="spinner${count}" class="graph-loader fa fa-spinner fa-spin fa-5x" style="display:none"></i>
                        <canvas id="myChart${count}" style="display:none"></canvas>
                    </div>
                </div>
            </div>
            `
        // Does the order of the dropdown matter
        // -> inactive then active or nah

        if (length == 0) {
            content.prepend(tracking_content)
        } else {
            $('.tracking-wrapper').last().after(tracking_content)
        }


        var data = "";

        $('.loadingIcon').hide()
        $('.searchBtn').click(function (event) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            let id = $(this).attr('id')
            dropdownArray[id] = "<option>No Queue Selected</option>";
            let checkStatus = $("#chk" + id).prop("checked")//This gets the status of the clicked item
            $('#loadingIcon' + id).show()

            $.ajax({
                url: "https://virtual-queue-ca2-p1936348.herokuapp.com/company/queue?company_id=" + $("#companyID" + id).val(),
                method: 'GET',
                success: function (data, status, xhr) {
                    

                    if (data.length > 0) {
                        dataArray[id] = data
                        for (var x = 0; x < data.length; x++) {
                            var dropdownSelector = "";
                            if(data[x].queue_id == queue){
                                dropdownSelector = "selected"
                            }
                            if (data[x].is_active == 1) {
                                dropdownArray[id] += `<option class="active" value='${data[x].queue_id}'${dropdownSelector}>${data[x].queue_id}</option>`;
                            } else if (data[x].is_active == 0 && !checkStatus) {
                                dropdownArray[id] += `<option class="active" value='${data[x].queue_id}'${dropdownSelector}>${data[x].queue_id} (Inactive)</option>`;
                            }
                        }
                        $('#errorMsg' + id).html("")
                    } else {
                        $('#errorMsg' + id).html("Company does not exist!")
                        alert("The company does not exist!")
                    }
                    $("#queueIDDropdown" + id).html(dropdownArray[id])
                    $('#loadingIcon' + id).hide()
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {//Error Function
                    // try jqXHR or xhr

                    $('#loadingIcon' + id).hide()
                    data = "";
                    dataArray[id] = data;
                    if (XMLHttpRequest.readyState == 4) {
                        if (XMLHttpRequest.responseJSON.code == "INVALID_QUERY_STRING") {
                            $('#errorMsg' + id).html("Company ID is invalid!")
                            alert("The company ID is invalid!")
                        } else if (XMLHttpRequest.status == 500) {
                            $('#errorMsg' + id).html("There was a server error.")
                            alert("Failed to fetch due to a server error.")
                        }
                    } else if (XMLHttpRequest.readyState == 0) {
                        alert("Failed to fetch.")
                    } else {
                        $('#errorMsg' + id).html("Unknown Error")
                        alert("There was an Unknown Error")
                    }
                    $("#queueIDDropdown" + id).html(dropdownArray[id])
                    // $('#loadingIcon' + id).hide()
                }
            })
        })

        $(".closeBtn").click(function () {
            let id = $(this).attr('id')
            $("#box" + id).remove()
            clearInterval(intervalArray[id - 1])
        })

        $(".queueIDDropdown").change(function () {
            let id = $(this).attr('id')
            let number = id.substring(15)
            if (this.value != "No Queue Selected") {
                queue = this.value
                let duration = 3;   // Change this value for the length of the array to change or smth

                $("#" + id).click(function () {
                    $("#spinner" + number).show()

                    var interval = setInterval(function () {   // New graph every 3 seconds
                        let dateNow = new Date();
                        let date3MinAgo = new Date(dateNow.getTime() - 3 * 60000)   // Gets time from 3 minutes ago
                        let dateISOString = date3MinAgo.toISOString().replace("Z", "%2B00:00");     // Z = +00:00, ask cher whether we shld change

                        $.ajax({
                            url: `https://virtual-queue-ca2-p1936348.herokuapp.com/company/arrival_rate?queue_id=${queue}&from=${dateISOString}&duration=${duration}`,
                            method: 'GET',
                            success: function (data, status, xhr) {
                                $("#warning" + number).hide()
                                $("#spinner" + number).show()
                                let labels = []
                                let counts = []

                                data.forEach(time => {
                                    labels.push(new Date(time.timestamp * 1000).toLocaleTimeString())
                                    counts.push(time.count)
                                });

                                setTimeout(function() {
                                    createGraph(number, labels, counts)
                                    $('#spinner' + number).hide()
                                    $('#myChart' + number).show()
                                }, 1000)
                            },
                            error: function (XMLHttpRequest, textStatus, errorThrown) { //Error Function
                                $("#spinner" + number).hide()

                                if (XMLHttpRequest.readyState == 4) {
                                    if (XMLHttpRequest.status == 500) {
                                        $('#errorMsg' + id).html("Server Error")
                                        $('#warning-wrapper').show()
                                        alert("Failed to fetch due to a Server Error")
                                    }
                                } else if (XMLHttpRequest.readyState == 0) {
                                    if ($("#box" + number).find('.chartjs-size-monitor').length == 0) { createGraph(number, [], []) }
                                    $('#myChart' + number).show()

                                    $("#warning" + number).show()
                                } else {
                                    alert("Unknown error occured.")
                                }
                            }
                        })
                    }, 3000)

                    if (intervalArray.length >= number) {
                        clearInterval(intervalArray[number - 1])
                    }
                    
                    intervalArray[number - 1] = interval
                })


            }
        })
        $(".chkInactive").change(function () {
            let id = $(this).attr('id')
            integerId = id.substring(id.length - 1, id.length)
            data = dataArray[integerId]
            dropdownArray[integerId] = "<option selected>No Queue Selected</option>";
            console.log(dropdownArray)
            console.log(data)
            if ($("#" + id).prop("checked")) {

                for (var x = 0; x < data.length; x++) {
                    if (data[x].is_active == 1) {
                        dropdownArray[integerId] += `<option class="active" value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                    }
                }

            } else {

                for (var x = 0; x < data.length; x++) {
                    if (data[x].is_active == 1) {
                        dropdownArray[integerId] += `<option value='${data[x].queue_id}'>${data[x].queue_id}</option>`;
                    } else {
                        dropdownArray[integerId] += `<option value='${data[x].queue_id}'>${data[x].queue_id} (Inactive)</option>`
                    }
                }

            }
            // id here is chk(number), we want the number, so we take the last character
            $("#queueIDDropdown" + integerId).html(dropdownArray[integerId])
        })
    })


    function createGraph(count, label, arrivalData) {
        var ctx = document.getElementById(`myChart${count}`);
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: label,
                datasets: [{
                    label: 'No. of Requests',
                    data: arrivalData, // [12, 19, 3, 5, 2, 3],
                    backgroundColor: 'rgba(0, 0, 255, 0.2)',
                    borderColor: 'rgba(0, 0, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Arrival Rate'
                },
                tooltips: {
                    // enabled: false,
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 10,
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 20,
                            stepSize: 2
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Requests'
                        }
                    }]
                },
                elements: {
                    line: {
                        tension: 0
                    },
                    point: {
                        radius: 0
                    }
                },
            }
        })
    }
})
// function removeTab(box){//Can we use HTML+Jquery?
//     document.getElementById(box).remove()
// }