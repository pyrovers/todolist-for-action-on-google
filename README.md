# todolist-for-action-on-google

Dialogflow からのリクエストを受け取って、特定のアカウントの Google ToDo リストにタスクを投げつける Firebase Function

ex.)  
~~~
「 OK グーグル、[Display name] に [taskName] を頼む 」  
~~~

~~~
「 OK グーグル、[Display name] に [date] までに [taskName] を頼む 」  
~~~

~~~
「 OK グーグル、[Display name] に繋いで 」
「 [date] までに [taskName] 」  
~~~


## 設定方法

1. デプロイ先の GCP プロジェクトに OAuth 2.0 クライアント ID を追加する  
   https://console.cloud.google.com/apis/credentials

2. credentials.json をダウンロードして functions/ に配置する

3. credentials.json の redirect_uris を https://developers.google.com/oauthplayground に設定する

4. OAuth 2.0 Playground で Tasks API v1 を選択し、TODOを送りたいアカウントで認証を行う  
   https://developers.google.com/oauthplayground/

5. Step 2 まで進め、refresh_token を作成する  

6. ダウンロードした credentials.json に refresh_token を追記する  
~~~  
[credentials.json]
{
  "web": {
    "client_id": "xxxxxxxxxxxx-xxxxxx…xxx.apps.googleusercontent.com",
    "project_id": "your-gcp-project-name",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
    "redirect_uris": ["https://developers.google.com/oauthplayground"]
  },
  "refresh_token": "1/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
~~~

7. デプロイを行う  
~~~  
firebase deploy --only functions
~~~

## Dialogflow Fulfillment  

### パラメータ  

* taskName ( `@sys.any` )  
  追加したいタスクの名称 ( 必須 )  

* date ( `@sys.date` )  
  タスクの期限 ( オプション )  
