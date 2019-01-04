$(document).ready(function () {

    var store = [];
    var brandvals = [];
    var productvals = {};
    var filterBtn =
        '<div class="ui floating labeled icon button filterBtn">' +
        '  <i class="filter icon"></i>' +
        '  <span class="text">Filter</span>' +
        '</div>';

    var table = $("#table").DataTable({
        info: false,
        deferRender: true,
        initComplete: function () {
            $('#table_wrapper').find(".eight").first().prepend(filterBtn);
            $('#table_wrapper .row').first().after(
                '<div class=\'row filtering\' style=\'padding: 0 14px 14px 14px\'>' +
                ' <div class="ui divider"></div>' +
                '<div class="ui stackable grid" style="width: 100%">' +
                '  <div class="four wide column">' +
                '<h5 class="ui header">Supplier</h5>' +
                '<select class="ui fluid dropdown" id="supplier">' +
                '</select>' +
                '</div>' +
                '  <div class="four wide column">' +
                '<h5 class="ui header">Product Brand</h5>' +
                '<select class="ui fluid dropdown" id="brand">' +
                '  <option value="">Brand</option>' +
                '</select>' +
                '    </div>' +
                '  <div class="four wide column">' +
                '<h5 class="ui header">Device</h5>' +
                '<select class="ui fluid dropdown" id="device">' +
                '  <option value="">Device</option>' +
                '</select>' +
                ' </div>' +
                '  <div class="four wide column"></div>' +
                '</div>' +
                '</div>'
            );
            $(".filtering").hide();
            $(".filterBtn").on('click', function () {
                $(".filtering").toggle();
            });
            $('#supplier').dropdown({
                placeholder: "Supplier",
                values: [
                    {
                        name: "Any",
                        value: "any",
                        selected: true
                    },
                    {
                        name: "Valueparts",
                        value: "valueparts"
                    },
                    {
                        name: "JSTech",
                        value: "jstech"
                    },
                    {
                        name: "MobileHQ",
                        value: "mobilehq"
                    },
                    {
                        name: "HiTechParts",
                        value: "hitechparts"
                    }
                ],
                onChange: function (value) {
                    console.log(value)
                    console.log($('#brand').val())
                    refilterdata(value, $('#brand option:selected').val())
                }
            });
        },
        "columns": [
            { "searchable": true },
            { "searchable": true },
            { "searchable": false, "type": "num-fmt", 'className': "dt-center", "defaultContent": "" },
            { "searchable": false, 'className': "dt-center", "orderable": false, "defaultContent": "" },
            { "searchable": false, 'className': "dt-center", "orderable": false }
        ]
    });


    var suppliers = ['valueparts', 'jstech', 'mobilehq', 'hitechparts'];

    for (let i = 0; i < suppliers.length; i++) {
        if (sessionStorage.getItem(suppliers[i])) {
            filterdata(JSON.parse(sessionStorage.getItem(suppliers[i])), suppliers[i])
        }
        else {
            getData(suppliers[i])
        }
    }

    function upperfirst(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    function filterSources(data) {
        for (i in data) {
            brandvals.push({
                name: i,
                value: i
            })
            var array = [];
            for (j in data[i]) {
                array.push({
                    name: j,
                    value: j
                }
                )
            }
            productvals[i] = array;
        }
        brandvals.unshift({
            name: "Any",
            value: "any",
            selected: true
        })
        $('#brand').dropdown({
            placeholder: "Brand",
            values: brandvals,
            onChange: function (value) {
                $('#device').dropdown('change values', productvals[value])
            }
        })

        $('#device').dropdown({
            placeholder: "Device",
        })
    }


    if (sessionStorage.getItem("sources")) {
        filterSources(JSON.parse(sessionStorage.getItem("sources")));
    }
    else {
        getSources()
    }

    function getSources() {
        $.ajax({
            type: 'GET',
            url: 'https://parts-scrapper.herokuapp.com/api/sources',
            mimeType: 'json',
            success: function (data) {
                sessionStorage.setItem("sources", JSON.stringify(data))
                filterSources(data)
            },
            error: function () {
                console.log('Failed to get data');
            }
        });
    }

    function getData(url) {
        $.ajax({
            type: 'GET',
            url: 'https://parts-scrapper.herokuapp.com/api/' + url,
            mimeType: 'json',
            success: function (data) {
                sessionStorage.setItem(url, JSON.stringify(data.data))
                filterdata(data.data, url)
            },
            error: function () {
                console.log('Failed to get data');
            }
        });
    }

    function filterdata(data, supplier) {

        for (i in data) { //Loop Over each device category
            for (j in data[i]) { // Loop over each device
                for (k in data[i][j]) { //Loop over each product
                    var price = data[i][j][k]['price'];
                    price = price.replace("$", "").replace('AU', '');
                    price = '$' + price
                    if (data[i][j][k]['public_price'] != undefined) {
                        store.push([upperfirst(supplier), data[i][j][k]['product_name'], price, data[i][j][k]['public_price'], '<a target="_blank"  href=' + data[i][j][k]['product_url'] + '><i class="external alternate icon"></i></a>'])
                    } else {
                        store.push([upperfirst(supplier), data[i][j][k]['product_name'], price, price, '<a target="_blank"  href=' + data[i][j][k]['product_url'] + '><i class="external alternate icon"></i></a>'])
                    }

                }
            }
        }
        table.clear().draw();
        table.rows.add(store); // Add new data
        table.columns.adjust().draw(); // Redraw the DataTable
    }


    function refilterdata(supplier, brand, device) {


        var data = JSON.parse(sessionStorage.getItem(supplier));
        console.log(data)
        if (data !== null){
        console.log(brand)
        console.log(data[brand])
            
        }

    }

    //     if (supplier !==undefined) {
    //         var data = sessionStorage.getItem(supplier)
    //         store = [];
    //         if (supplier == 'any'){
    //             for (let i = 0; i < suppliers.length; i++) {
    //                 filterdata(data, suppliers[i])
    //             }
    //         }
    //         if (data !== null) {
    //             filterdata(JSON.parse(data), supplier)
    //         }
    //     }
    //     if (brand !== undefined){

    //     }
    // }

});