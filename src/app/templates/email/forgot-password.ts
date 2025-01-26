export const forgotPasswordTemplate = `<html>
  <head>
    <title>{{title}}</title>
    <style>
        body {
            background-color: black;
            color: white;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .message-box {
            background-color: black;
            border: 1px solid white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px auto;
            max-width: 500px;
        }
        .reset-link {
            display: inline-block;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border: 1px solid white;
            border-radius: 5px;
            margin: 20px 0;
        }
        .reset-link:hover {
            background-color: white;
            color: black;
        }
        .logo-box {
          background-color: green;
        }
        .logo-box.logo-img {
          top: 50%;
          bottom: 50%;
          transform: translate(-50%, -50%);
        }
        .code {
            font-family: monospace;
            font-size: 1.2em;
            letter-spacing: 2px;
            margin: 20px 0;
        }
    </style>
  </head>
  <body>
    <table align="center">
      <tr>
        <td>
          <img class="logo-img" width="64" height="64" src="https://i.postimg.cc/6QzXvQpZ/microblog-logo.png" />
        </td>
       <td>
        <h1 style="display: inline-block;">Microblog</h1>
       </td>
      </tr>
    </table>
    <h2>{{title}}</h2>
    
    <img width="48" height="48" src="https://i.postimg.cc/vm7mSMH8/locker.png" />

    <div class="message-box">
        <p>{{body}}</p>
        <div class="code">{{code|default('A1B2C3D4')}}</div>
        <a href=\"{{url}}\" class="reset-link">Reset password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
    </div>
  </body>
</html>`;