//this is literally the most cancerous promise filled hoopla, please forgive me

const mal_aut = function(){
  let atoken, rtoken, expiry;
  let iprom;


  function init(){
    iprom = new Promise(function(resolve, reject){
      chrome.storage.local.get(['access', 'expiry', 'refresh'], function(result){
        atoken = result.access;
        rtoken = result.refresh;
        expiry = result.expiry;
        resolve();
      });
    });
    return iprom;
  }

  function isregistered(){
    return iprom.then(function(){
      return rtoken;
    });
  }

  function register(){
    let code_v = makeid(128);
    let code_c = code_v;
  
    chrome.identity.launchWebAuthFlow({
      interactive:true,
      url: `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${code_c}`
    }, function(url){
      let params = url.substr(url.indexOf("?"));
      let urlp = new URLSearchParams(params);
      let code = urlp.get("code");
      
      let t_url = 'https://myanimelist.net/v1/oauth2/token';
      var http = new XMLHttpRequest();
      let params2 = `client_id=${CLIENT_ID}&code=${code}&code_verifier=${code_v}&grant_type=authorization_code`;
      http.responseType = 'json';
      http.open('POST', t_url, true);
  
      //Send the proper header information along with the request
      http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  
      http.onreadystatechange = function() {//Call a function when the state changes.
          if(http.readyState == 4 && http.status == 200) {
             let token_info = http.response;
             let time = new Date();
             time.setSeconds(token_info["expires_in"])
             expiry = time;
             rtoken = token_info["refresh_token"];
             atoken = token_info["access_token"];
             
             chrome.storage.local.set({
               access: token_info["access_token"],
               expiry: time,
               refresh: token_info["refresh_token"]
             }, function(){
               window.close();
             })
             
          }
      }
      http.send(params2);
    });
  }

  //returns a promise that will refresh the token
  function refresh_token(){
    return iprom.then(function(){
      return new Promise(function(resolve, reject){
        let t_url = 'https://myanimelist.net/v1/oauth2/token';
        let http = new XMLHttpRequest();
        let params2 = `client_id=${CLIENT_ID}&grant_type=refresh_token&refresh_token=${rtoken}`;
        http.responseType = 'json';
        http.open('POST', t_url, true);
  
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  
        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
              let token_info = http.response;
              let time = new Date();
              time.setSeconds(token_info["expires_in"])
              expiry = time;
              rtoken = token_info["refresh_token"];
              atoken = token_info["access_token"];
              
              chrome.storage.local.set({
                access: token_info["access_token"],
                expiry: time,
                refresh: token_info["refresh_token"]
              }, function(){
                resolve();
              })   
            }
        }
        http.send(params2);
      })
    });
  }

  function is_atoken_safe(){
    return iprom.then(function(){
      return new Date() < expiry
    });
  }

  function get_atoken(){
    return isregistered().then(function(registered){
      if (!registered){
        throw new Exception("Trying to get token from unregistered extension");
      }
    }).then(function(){
      return is_atoken_safe();
    }).then(function(safe){
      if (!safe){
        return refresh_token();
      }
    }).then(function(){
      return atoken;
    });
  }

  return {
    init: init,
    isregistered: isregistered,
    register: register,
    get_atoken: get_atoken
  }
}()
