// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
$('.mi-link').click(() => {
    $('.post-area').val($('.post-area').val() + '[url=][/url]');
});
$('.mi-map').click(() => {
    $('.post-area').val($('.post-area').val() + '[loc=/]');
});
$('.mi-vid').click(() => {
    let video = prompt('This is an example. Please, insert a YouTube url.');
    $('.post-area').val(video);
});
$('.file-upload').change(() => {
    $('.frm-upload').submit();
    $('.preloader').animate({ width: '100%' }, 6000, () => {
        $('.preloader').css('width', 0);
    });
    $('.uploads').html('<li>' + $('.file-upload').val() + '</li>');
    if ($('.file-upload').val().indexOf('\\') !== -1) {
        $('.file-name').val($('.file-upload').val().substring($('.file-upload').val().lastIndexOf('\\') + 1));
    } else if ($('.file-upload').val().indexOf('/') !== -1) {
        $('.file-name').val($('.file-upload').val().substring($('.file-upload').val().lastIndexOf('/') + 1));
    } else {
        $('.file-name').val($('.file-upload').val() + 1);
    }
    
});
$('.mi-mood').click(() => {
    $('.emojis').fadeToggle(200);
});
$('.emoji').click(function() {
    $('.post-area').val($('.post-area').val() + $(this).html());
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('**=', '<img src="/img/users/'));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('/**', '" />'));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('[url=', '<a href="'));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('[/url]', '</a>'));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('/]', "q&ampoutput=embed&amp;source=s_q&amp;aq=4&amp;ie=UTF8&amp;"
        + "t=m&amp;z=11"
        + "\"" + "></iframe>"));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll(']', '">'));
});
$('.post').each(function (index) {
    $(this).html($(this).html().replaceAll('[loc=', "<iframe id=\"map_frame\" style=\"border-radius:20px;position:static\" "
        + "width=\"100%\" height=\"250px\" frameborder=\"0\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\" "
        + "src=\"https://www.google.sk/maps?q="));
});
$('.content').each(function (index) {
    $(this).html($(this).html().substring($(this).html().indexOf('&list')));
    let match = $(this).html().match(/(http:|https:)?\/\/(www\.)?(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/);
    if (match != null) {
        console.log(match.input);
        if (match.input.indexOf('&') >= 0) {
            $(this).html($(this).html().replace(match.input, '<iframe style="height:250px;width:100%;max-width:100%;border:0;" frameborder="0" src="https://www.youtube.com/embed/' + match.input.substring(0, match.input.indexOf('&')).replace('https://www.youtube.com/watch?v=', '') + '?hl=en&amp;autoplay=0&amp;cc_load_policy=0&amp;loop=0&amp;iv_load_policy=0&amp;fs=1&amp;showinfo=0"></iframe>'));
        } else {
            $(this).html($(this).html().replace(match.input, '<iframe style="height:250px;width:100%;max-width:100%;border:0;" frameborder="0" src="https://www.youtube.com/embed/' + match.input.replace('https://www.youtube.com/watch?v=', '') + '?hl=en&amp;autoplay=0&amp;cc_load_policy=0&amp;loop=0&amp;iv_load_policy=0&amp;fs=1&amp;showinfo=0"></iframe>'));
        }
    }
});
$('.like-anchor').click(function () {
    let elem = $(this);
    $.post("/like/" + elem.attr('data-postid'), function (result) {
        if (result.status == 'created') {
            elem.next().html(parseInt(elem.next().html()) + 1);
        }
        else {
            alert(result.status);
        }
    });
});