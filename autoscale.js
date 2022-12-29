var can = $("canvas");
$("body").css("overflow", "hidden");
$(document).ready(function () {
    can.css("position", "absolute")
    var winH = $(window).height(), winW = $(window).width();
    var proc = "height";
    if (can.width() > (winW - 20) || can.height() > (winH - 20)) {
        if ((can.width() - (winW - 20)) > (can.height() - (winH - 20))) {
            proc = 'width'
        }
    }

    if ((winH - 120) < can[proc]())
        var ww = (winH - 120) / can[proc]() - 0.01;

    if (proc === 'width') {
        if ((winW - 20) < can[proc]())
            ww = (winW - 20) / can[proc]() - 0.01;
    }

    if (!ww) ww = 1;
    can.css("transform", "scale(" + ww + ")")

    var left = (winW - can.width()) / 2 + 15;
    var offset = (can[proc]() / 2 - (40 * ww)) * (1 - ww) * -1;
    can.css("left", (left ) + "px").css("top", offset + "px")
})