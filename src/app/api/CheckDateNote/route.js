import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/auth.config";


export async function POST(request) {
    const session = await getServerSession(authOptions);
    const accessToken = session.accessToken;
    console.log(session)
    console.log(accessToken)
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { lol: session });
    }
    
    // Create OAuth2Client
    const oauth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
    
    // Set credentials
    oauth2Client.setCredentials({
        access_token: session.accessToken,
    });
    
    // Initialize Drive client with oauth2Client
    const drive = google.drive({
        version: "v3",
        auth: oauth2Client
    });


    try {
        const { date } = await request.json();
        const fileName = `${date}.txt`;

        // First, find or create the Journal folder
        const folderResponse = await drive.files.list({
            q: "name = 'Journal' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: 'files(id, name)',
        });

        let folderId;

        if (folderResponse.data.files.length > 0) {
            folderId = folderResponse.data.files[0].id;
        } else {
            // Create Journal folder if it doesn't exist
            const folderMetadata = {
                name: 'Journal',
                mimeType: 'application/vnd.google-apps.folder',
            };
            const newFolder = await drive.files.create({
                resource: folderMetadata,
                fields: 'id',
            });
            folderId = newFolder.data.id;
        }

        // Search for the note file in the Journal folder
        const fileResponse = await drive.files.list({
            q: `name = '${fileName}' and '${folderId}' in parents and trashed = false`,
            fields: 'files(id, name)',
        });

        // If no file exists, return null content
        if (fileResponse.data.files.length === 0) {
            return NextResponse.json({
                content: null,
                message: 'No note found for this date'
            });
        }

        // Get the file content
        const fileId = fileResponse.data.files[0].id;
        const file = await drive.files.get({
            fileId: fileId,
            alt: 'media',
        });

        return NextResponse.json({
            content: file.data,
            message: 'Note retrieved successfully'
        });

    } catch (error) {
        console.error('Error accessing Google Drive:', error);
        return NextResponse.json({
            error: 'Failed to access Google Drive',
            message: error.message
        }, { status: 500 });
    }
}