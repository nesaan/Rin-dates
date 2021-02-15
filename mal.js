const malr = function(){

  function get_name(){
    const url = 'https://api.myanimelist.net/v1/users/@me';
    return make_request(url, "GET", {}).then(function(result){return result.name});
  }

  function get_watching(){
    const url = 'https://api.myanimelist.net/v1/users/@me/animelist?status=watching&fields=id,title,my_list_status{num_watched_episodes},num_episodes';
    return make_request(url, "GET", {}).then(function(result){
      return result.data.map(function(item){
        return {
          id: item.node.id,
          title: item.node.title,
          tepisodes: item.node.num_episodes,
          episodes: item.node.my_list_status.num_episodes_watched
        }
      });
    });
  }

  function updateAnime(id, score, episodes){
    const url = `https://api.myanimelist.net/v1/anime/${id}/my_list_status`;
    const reqp = {};
    if (score !== null){
      reqp.score = score;
    }
    if (episodes !== null){
      reqp.num_watched_episodes = episodes;
    }
    make_request(url, "PATCH", reqp);
  }

  function make_request(url, method, rparams, wrapToken = true){
    return mal_aut.get_atoken().then(function(token){
      return new Promise(function(resolve, reject){
        let http = new XMLHttpRequest();
        let params = "";
        for (var entry of Object.entries(rparams)){
          params += `${entry[0]}=${entry[1]}&`
        }
        params = params.slice(0,-1);
  
        http.responseType = 'json';
  
        http.open(method, url, true);
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        if (wrapToken){
          http.setRequestHeader('Authorization', `Bearer ${token}`)
        }
      
        http.onreadystatechange = function(){
          if (http.readyState == 4 && http.status == 200){
            resolve(http.response);
          }
          else if (http.readyState == 4){
            reject(http.code);
          }
        }
        http.send(params);
      });
    });
  }


  return {
    updateAnime: updateAnime,
    get_watching: get_watching,
    get_name:get_name
  }
}();