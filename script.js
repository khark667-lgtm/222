// ==========================================
// 🗺️ 1. إعداد الخريطة الأساسية
// ==========================================

var map = L.map('map-container').setView([26.28, 31.96], 12);

var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
});

satellite.addTo(map);

var baseMaps = {
    "الشارع": streets,
    "قمر صناعي": satellite
};

// ==========================================
// 🚧 2. علامات السدود (دون تغيير)
// ==========================================

var dams = [
    {
        name: "سد 1",
        coords: [26.263324, 32.255599],
        label: 1,
        desc: " السعة: 1.093 مليون م³ |  الارتفاع: 11 م<br> قطاع استراتيجي يحجز الجريان المبكر"
    },
    {
        name: "سد 2",
        coords: [26.267121, 32.279742],
        label: 2,
        desc: " السعة: 596 ألف م³ |  الارتفاع: 10 م<br> قاع مستوٍ يُسهّل الإنشاء"
    },
    {
        name: "سد 3",
        coords: [26.277584, 32.288496],
        label: 3,
        desc: " السعة: 1.175 مليون م³ |  الارتفاع: 11 م<br> أعلى سعة تخزينية بين المواقع"
    },
    {
        name: "سد 4",
        coords: [26.300699, 32.241848],
        label: 4,
        desc: " السعة: 345 ألف م³ |  الارتفاع: 7 م<br> رافد شرقي، تكاليف منخفضة"
    },
    {
        name: "سد 5",
        coords: [26.302416, 32.237725],
        label: 5,
        desc: " السعة: 223 ألف م³ |  الارتفاع: 4 م<br> قطاع سفلي، ارتفاع منخفض جداً"
    },
    {
        name: "سد 6",
        coords: [26.315487, 32.244496],
        label: 6,
        desc: " السعة: 735 ألف م³ |  الارتفاع: 8 م<br> قاع مستوٍ، بديل عالي الأولوية"
    },
    {
        name: "سد 7",
        coords: [26.329437, 32.235983],
        label: 7,
        desc: " السعة: 723 ألف م³ |  الارتفاع: 9 م<br> نظام متكامل مع السد 6"
    },
    {
        name: "سد 8",
        coords: [26.336134, 32.245146],
        label: 8,
        desc: " السعة: 207 ألف م³ |  الارتفاع: 7 م<br> أقصى امتداد مجدي على الرافد"
    },
    {
        name: "سد 9",
        coords: [26.334566, 32.249069],
        label: 9,
        desc: " السعة: 64 ألف م³ |  الارتفاع: 5 م<br> رافد شرقي صغير، سعة محدودة"
    }
];

function createDamIcon(number) {
    return L.divIcon({
        html: '<div class="dam-circle">' + number + '</div>',
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

dams.forEach(function(dam) {
    var marker = L.marker(dam.coords, { icon: createDamIcon(dam.label) }).addTo(map);
    marker.bindPopup("<b>" + dam.name + "</b><br>" + dam.desc);
});

// ==========================================
//  3. دوال الألوان
// ==========================================

function getColor(value) {
    var num = Number(value);
    switch (num) {
        case 1: return '#d73027';
        case 2: return '#fc8d59';
        case 3: return '#fee08b';
        case 4: return '#91cf60';
        case 5: return '#1a9850';
        default: return '#cccccc';
    }
}

function getBlueDepth(value) {
    var num = Number(value);
    switch (num) {
        case 1: return '#cceeff'; // فاتح جداً
        case 2: return '#99ccff';
        case 3: return '#6699ff';
        case 4: return '#3366ff';
        case 5: return '#0033cc'; // غامق
        default: return '#ffffff';
    }
}

// ==========================================
//  4. تحميل جميع الطبقات الإضافية
// ==========================================

var overlayMaps = {};
var loadedLayers = [];

// دالة مساعدة لتحميل GeoJSON
function loadLayer(url, styleFunc, name, onEachFeatureFunc) {
    return fetch(url)
        .then(function(response) {
            if (!response.ok) throw new Error('فشل تحميل ' + name);
            return response.json();
        })
        .then(function(data) {
            var options = {
                style: styleFunc,
                interactive: false
            };
            if (onEachFeatureFunc) {
                options.onEachFeature = onEachFeatureFunc;
            }
            var layer = L.geoJSON(data, options);
            return { name: name, layer: layer };
        })
        .catch(function(error) {
            console.warn('تخطي طبقة: ' + name, error);
            return null;
        });
}

// خريطة الملاءمة
var suitabilityPromise = loadLayer(
    'mota2.json',
    function(feature) {
        var val = feature.properties.gridcode || feature.properties.Value;
        return {
            fillColor: getColor(val),
            fillOpacity: 1.0,
            weight: 0,
            color: '#666',
            opacity: 1
        };
    },
    "خريطة الملاءمة",
    function(feature, layer) {
        var val = feature.properties.gridcode || feature.properties.Value;
        var text = "";
        if(val==1) text="منخفضة جداً";
        else if(val==2) text="منخفضة";
        else if(val==3) text="متوسطة";
        else if(val==4) text="عالية";
        else if(val==5) text="عالية جداً";
        layer.bindPopup("<b>درجة الملاءمة:</b> " + val + "<br>(" + text + ")");
    }
);

// حدود الوادي
var borderPromise = loadLayer(
    'border.geojson',
    function() {
        return {
            color: 'black',
            weight: 3,           // bold
            fillColor: 'black',
            fillOpacity: 0.1    // شفاف 50%
        };
    },
    "حدود الوادي"
);

// أعماق الغمر - منفرد
var floodSoloPromise = loadLayer(
    'flood_solo.geojson',
    function(feature) {
        var val = feature.properties.gridcode || feature.properties.Value;
        return {
            fillColor: getBlueDepth(val),
            fillOpacity: 0.7,
            weight: 0,
            color: '#666',
            opacity: 0
        };
    },
    "أعماق الغمر (منفرد)",
    function(feature, layer) {
        var val = feature.properties.gridcode || feature.properties.Value;
        layer.bindPopup("عمق الغمر (منفرد): الفئة " + val);
    }
);

// أعماق الغمر - مشترك مع وادي أبو نافوخ
var floodCombinedPromise = loadLayer(
    'flood_combined.geojson',
    function(feature) {
        var val = feature.properties.gridcode || feature.properties.Value;
        return {
            fillColor: getBlueDepth(val),
            fillOpacity: 0.7,
            weight: 0,
            color: '#666',
            opacity: 0
        };
    },
    "أعماق الغمر (مع أبو نافوخ)",
    function(feature, layer) {
        var val = feature.properties.gridcode || feature.properties.Value;
        layer.bindPopup("عمق الغمر (مشترك): الفئة " + val);
    }
);

// تحميل الكل
Promise.all([suitabilityPromise, borderPromise, floodSoloPromise, floodCombinedPromise])
    .then(function(results) {
        results.forEach(function(item) {
            if (item) {
                item.layer.addTo(map);
                overlayMaps[item.name] = item.layer;
            }
        });

        // إنشاء أداة التحكم مرة واحدة تشمل الكل
        L.control.layers(baseMaps, overlayMaps).addTo(map);

        // تكبير على خريطة الملاءمة إن وجدت
        if (overlayMaps["خريطة الملاءمة"] && overlayMaps["خريطة الملاءمة"].getBounds().isValid()) {
            map.fitBounds(overlayMaps["خريطة الملاءمة"].getBounds(), { padding: [50, 50] });
        }
    })
    .catch(function(error) {
        console.error(' فشل تحميل إحدى الطبقات الأساسية:', error);
        alert('تعذر تحميل بعض الطبقات. تأكد من المسارات.');
        // حتى لو فشل الكل، نظهر الأساسيات
        L.control.layers(baseMaps).addTo(map);
    });

// ==========================================
//  5. وسيلة إيضاح الملاءمة (بقيت كما هي)
// ==========================================
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1, 2, 3, 4, 5];
    var labels = ['منخفضة جداً', 'منخفضة', 'متوسطة', 'عالية', 'عالية جداً'];
    
    div.innerHTML = '<h4>درجة الملاءمة</h4>';
    
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + ' (' + labels[i] + ')<br>';
    }
    return div;
};

legend.addTo(map);












