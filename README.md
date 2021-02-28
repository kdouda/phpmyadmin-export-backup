# PHPMyAdmin Dumper

This project aims to create a simple tool that dumps a single MySQL database using the phpMyAdmin interface from Wordpress webhosts that do not provide backups. This project is using puppeteer, a headless Chrome browser to navigate through the page. After the export is complete, the SQL file is exported to the `./exports` directory. It is recommended to move that file into an appropriate location with another script, since the name will always remain the same.

This script was tested only on the 3.5.8.2 version of PMA. Some details, such as the wait timeouts may need to be adjusted for the connection/server speed of the client or the server provider or rewritten to wait for the frame elements properly.

## Configuration
Create a file called `credentials.json` and place it into root directory where `index.js` is located. For a full example, see `credentials.sample.json`.

```json
{
    "username": "dbuser",
    "password": "dbpwd",
    "database": "dbname",
    "pma": "https://pma.oldwebhost.com"
}
```

All fields are self-explanatory. The PMA parameter is the base URL of the phpMyAdmin interface the web host provides.

## Running

Run ```npm i``` to install the puppeteer dependency (this will download a version of headless Chrome). Edit the `credentials.json` file as you need to ensure everything is configured properly.

Type `npm run backup` into your console. This should launch headless Chrome and dump the database contents into the `exports` directory.