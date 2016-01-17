# Spark OAuth Sample

Function Description: If you want to do something (like create a room, or send a message) on Spark on behalf of someone else, you need to request permissions to the person. This application provides you with a user interface (web) where the person can accept your request and send the generated token to you. You can define the access scope, client ID, client secret(note this changes everytime you log in/out your Spark account) in a configuration file.

Installation
============

To get started you will first need to have Node.js installed. Going to [node.js](https://nodejs.org/), it will automatically detect your OS and offer the download link. After you get the installer, just double click it and follow the "next step" to complete the installation. For Linux OS, it provides [Linux Binaries (.tar.gz)](https://nodejs.org/en/download/) in both 32-bit and 64-bit. Download the .gz file to your machine and uncompress it, configure the PATH, then you can use it.


To install this sample to your local machine, you can either use NPM (Node Package Manager): 

<pre>
	npm install --save spark-oauth-sample
</pre>

or download it from [here](https://github.com/tropo/tropo-webapi-node/archive/master.zip), then uncompress and place it into your project folder. 


Configuration
=============

1. You will first need to create an application on "Spark For Developer" platform following the instructions. 

2. After an application is created, you will see a unique client ID and a unique client Secret ID in the top-right of the page.

3. Go to the "conf" folder of this sample, open the config.json.

4. Copy the client ID to the "clientID" field, and copy the client Secret to the "clientSecret" field.

5. Choose the redirect URL you want to use, and copy it to "redirectURIUnencoded" field. The redirect URL must be one of the redirect URLs in your application.

6. Encode the URL in step 5 (from a tool, i.e. http://meyerweb.com/eric/tools/dencoder/), then fill the encoded URL into "redirectURI" field.

7. Copy out the values of the scope from your application, use whitespace character to seperate them if there are multiple values.

8. Encode the values (from a tool, i.e. http://meyerweb.com/eric/tools/dencoder/), then fill the encoded values into "scope" field.

9. Change the "contactEmail" field to your email address (as the requester).

10. You can change the 'state' field to a more secure string (i.e. a random UUID string), or keep it as it as just for testing.

11. If you want to put the sample into a public address, then you will need to change the hostname 127.0.0.0 and port 300 to the real ones.

12. Save it, and it's compelte.


Running
-------

You can run the application within the project directory with:

<pre>
	node app.js
</pre>

http://host:port/ is the home page.

Note: A token management center will come soon!


