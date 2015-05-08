var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var players = {},
    swaps = [],
    swapSpeed = null;

function onYouTubeIframeAPIReady() {
    //  iframe ready
}

$(document).ready(function(){
    $('[data-load]').click(function(event){
        var target = $(event.currentTarget),
            videoBox = target.closest('.video-box'),
            playerID = videoBox.data('player-id'),
            playerEl = videoBox.find('#' + playerID),
            videoUrl = videoBox.find('[data-url]').val(),
            videoID = videoUrl.split('?v=')[1],
            player = players[playerID];

        if (!videoID) {
            return;
        }

        if (player) {
            if (player.getVolume() > 0) {
                return;
            }

            var wrapper = playerEl.closest('.player-wrapper');
            playerEl.remove();
            wrapper.append('<div id="' + playerID + '"></div>');
        }

        var player = new YT.Player(playerID, {
            height: '150px',
            width: '100%',
            videoId: videoID,
            events: {
                onReady: function(event) {
                    player.setVolume(0);
                    event.target.playVideo();
                }
            }
        });

        players[playerID] = player;
    });

    $('[data-swap]').change(function(event){
        var target = $(event.currentTarget),
            isChecked = target.is(':checked'),
            playerID = target.data('swap');

        if (isChecked) {
            swaps.push(playerID);
        }else{
            var index = swaps.indexOf(playerID);
            if (index > -1) {
                swaps.splice(index, 1);
            }
        }

        if (swaps.length == 2) {
            $('[data-swap]').each(function(index, el){
                el = $(el);
                if (_.indexOf(swaps, el.data('swap')) == -1) {
                    el.attr('disabled', true);
                }
            });

            if (players[swaps[0]] || players[swaps[1]]) {
                $('[data-do-swap]').removeAttr('disabled');
            }else{
                $('[data-do-swap]').attr('disabled', true);
            }
        }else{
            $('[data-swap]').each(function(index, el){
                $(el).removeAttr('disabled');
            });
            $('[data-do-swap]').attr('disabled', true);
        }
    });

    var swapVolumes = function(player1, player2, changeCount) {
        //  increased player1's and decreases player2's volumes
        changeCount = changeCount || 0;

        if (changeCount < 20) {
            if (changeCount == 0) {
                $('[data-do-swap]').attr('disabled', true);
                player1.setVolume(0);
                player1.unMute();
            }

            player1.setVolume(player1.getVolume() + 5);
            player2.setVolume(player2.getVolume() - 5);

            _.delay(function(){
                swapVolumes(player1, player2, changeCount + 1);
            }, swapSpeed);
        }else{
            player2.mute();

            swaps = [];
            $('[data-swap]').attr('checked', false);
            $('[data-swap]').removeAttr('disabled');
        }
    };

    $('[data-do-swap]').click(function(event){
        var player1 = players[swaps[0]],
            player2 = players[swaps[1]];

        swapSpeed = parseInt($('[name="swap-speed"]:checked').val());

        if (player1.isMuted()) {
            swapVolumes(player1, player2);
        }else{
            swapVolumes(player2, player1);
        }
    });
});