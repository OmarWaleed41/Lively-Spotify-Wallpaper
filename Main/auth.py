import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, jsonify
from flask_cors import CORS

cache_dir = os.path.join(os.getcwd(), '.cache')
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

app = Flask(__name__)

CORS(app)

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id='client-ID-here',
    client_secret='secret-key-here',
    redirect_uri='http://localhost:8888/callback',
    scope="user-library-read user-read-playback-state",
))

previous_track_id = None

@app.route('/current_track', methods=['GET'])
def get_current_track():
    global previous_track_id
    
    track = sp.current_playback()
    
    if not track or not track.get('item'):
        return jsonify({
            'is_playing': False,
            'changed': False
        })

    current_track_id = track['item']['id']
    has_changed = current_track_id != previous_track_id
    
    if has_changed:
        previous_track_id = current_track_id
        return jsonify({
            'is_playing': track.get('is_playing', False),
            'current_track_name': track['item']['name'],
            'current_album_name': track['item']['album']['name'],
            'artist': track['item']['artists'][0]['name'],
            'album_cover': track['item']['album']['images'][1]['url'],
            'changed': True
        })
    
    return jsonify({
        'is_playing': track.get('is_playing', False),
        'changed': False
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)