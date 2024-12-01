import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { OAuth2Client } from "google-auth-library";
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/auth.config";
import { Readable } from "stream";

export async function POST(req) {
  try {

    // check if session is active
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Retrieve text from request body
    const form = await req.formData();
    const textContent = form.get('content');
    const dateContent = form.get('date');

    // Check if there's text content
    if (!textContent) {
      return NextResponse.json({ error: 'No text content provided' }, { status: 400 });
    }

    // 2. Format the current date for the filename
    // const currentDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    // const filename = `${currentDate}.txt`;
    const filename = `${dateContent}.txt`;

    // // 3. Prepare text content as a Buffer
    // const fileBuffer = Buffer.from(textContent, 'utf-8');

    // Convert the text content to a Blob and then to a readable stream
    const fileStream = Readable.from(textContent);

    // 4. Set up Google Drive API authentication
    // const oAuth2Client = new google.auth.OAuth2();
    // oAuth2Client.setCredentials({ access_token: accessToken });
    // const drive = google.drive({ version: "v3", auth: oAuth2Client });

        const oauth2Client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          });
      
          oauth2Client.setCredentials({
            access_token: session.accessToken,
          });
      
          const drive = google.drive({ 
            version: "v3", 
            auth: oauth2Client 
          });
      
console.log(session.accessToken)
    // 5. Check if "Journal" folder exists or create it if not
    let folderId;
    const folderName = 'Journal';

    // Search for folder named "Journal"
    const folderSearch = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (folderSearch.data.files.length > 0) {
      // Folder exists
      folderId = folderSearch.data.files[0].id;
    } else {
      // Folder doesn't exist, create it
      const folderCreation = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderId = folderCreation.data.id;
    }

    // // 6. Create and upload the file in the "Journal" folder
    // const response = await drive.files.create({
    //   requestBody: {
    //     name: filename,
    //     mimeType: 'text/plain',
    //     parents: [folderId],  // Specify the folder ID here
    //   },
    //   media: {
    //     mimeType: 'text/plain',
    //     body: fileStream,
    //   },
    // });

    // Search for an existing file with the same filename in the "Journal" folder
    const fileSearch = await drive.files.list({
        q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });
  
      let fileId;
      if (fileSearch.data.files.length > 0) {
        // File exists, get the file ID
        fileId = fileSearch.data.files[0].id;
      }
  
      let response;
      if (fileId) {
        // Update the existing file
        response = await drive.files.update({
          fileId,
          media: {
            mimeType: 'text/plain',
            body: fileStream,
          },
        });
      } else {
        // Create a new file if it doesn't exist
        response = await drive.files.create({
          requestBody: {
            name: filename,
            mimeType: 'text/plain',
            parents: [folderId],
          },
          media: {
            mimeType: 'text/plain',
            body: fileStream,
          },
        });
      }


    // Return success response
    return NextResponse.json({ message: 'File uploaded successfully', fileId: response.data.id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
