import fs from "fs"
import path from 'path';
import { createId } from "@paralleldrive/cuid2";

export async function uploadProfilePicture(file: File): Promise<string | undefined> {

    if(file.size === 0 || file.name === ""){
        return undefined;
    }
    
    const __dirname = path.dirname("~")
    const uploadDir = path.join(__dirname, 'public', 'pps');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = createId()+'.jpg'
    const filePath = path.join(uploadDir, fileName);

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        return fileName;


    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to upload profile picture');
    }
}