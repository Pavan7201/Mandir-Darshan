import { MongoClient } from "mongodb";
import fs from "fs";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "test";

async function updateTempleLocations() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const assetsCollection = db.collection("assets");

        const templeDoc = await assetsCollection.findOne({ category: "temple" });
        if (!templeDoc) {
            console.log("No temple document found.");
            return;
        }

        const mapping = JSON.parse(fs.readFileSync("templeLocations.json", "utf-8"));

        const updatedItems = templeDoc.items.map((item) => {
            const location = mapping[String(item.id)];
            if (!location) {
                console.warn(`No mapping found for temple id: ${item.id}`);
                return item;
            }
            return {
                ...item,
                location: {
                    district: location.district,
                    state: location.state,
                },
            };
        });


        await assetsCollection.updateOne(
            { _id: templeDoc._id },
            { $set: { items: updatedItems } }
        );

        console.log("✅ All temple locations updated!");
    } catch (err) {
        console.error("Error updating temple locations:", err);
    } finally {
        await client.close();
    }
}

updateTempleLocations();
