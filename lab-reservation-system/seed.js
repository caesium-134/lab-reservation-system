const mongoose = require("mongoose");
const User = require("./models/user");
const Reservation = require("./models/reservations");
const Laboratory = require("./models/laboratories");

mongoose.connect("mongodb://127.0.0.1:27017/appDB");

async function seedDB() {
    try {
        await User.deleteMany({});
        await Laboratory.deleteMany({});

        await User.insertMany([
            {
                username: "jvalerio",
                password: "1234",
                idNumber: "12412394",
                name: "Joaquin Valerio",
                email: "jqvalerio@gmail.com",
                bio: "What's up! I'm Joaquin. I'm a Legal Management major studying in De La Salle University.",
                schoolYear: "2nd Year",
                birthday: "2005-02-14",
                college: "COLLEGE OF LIBERAL ARTS",
                course: "Legal Management",
                profilePic: "https://images.hobbydb.com/processed_uploads/subject_photo/subject_photo/image/118823/1698177013-2390-3560/josh_large.png",
                header: "https://static.wikia.nocookie.net/spongebob/images/9/9d/Man_Ray_Returns_001.png/revision/latest/scale-to-width-down/1200?cb=20171001162510"
            },
            {
                username: "dylanpena",
                password: "1234",
                idNumber: "12455857",
                name: "Dylan Penalotha",
                email: "dylanpenalotha@gmail.com",
                bio: "Hi! I'm Dylan. I enjoy programming and working on web applications.",
                schoolYear: "2nd Year",
                birthday: "2004-07-21",
                college: "COLLEGE OF COMPUTER STUDIES",
                course: "Information Technology",
                profilePic: "https://preview.redd.it/why-rowlet-is-the-best-v0-3e6sa5klo4ne1.jpg?width=1080&crop=smart&auto=webp&s=d41ed2edaa0e31c21a9525022e19b08d77b93575",
                header: "https://i.pinimg.com/1200x/27/88/2d/27882d953c061ee056a90b447f75b00c.jpg"
            },
            {
                username: "jacque",
                password: "1234",
                idNumber: "12212586",
                name: "Jacque Tamainta",
                email: "jacquet@gmail.com",
                bio: "Hey, I'm Jacque. I love playing the guitar and making movies.",
                schoolYear: "3rd Year",
                birthday: "2005-02-14",
                college: "COLLEGE OF LIBERAL ARTS",
                course: "Communication",
                profilePic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSmKLZorqZN5FegoFmcM2NxpXCdHjYhuQiAA&s",
                header: "https://www.fisheries.noaa.gov/s3//styles/original/s3/2025-07/640x427-Green-Turtle-NOAAFisheries.png?itok=ZG5DGBiW"
            },
            {
                username: "qingsv",
                password: "1234",
                idNumber: "12144598",
                name: "Qings Z. Valli",
                email: "qingsvallireal@gmail.com",
                bio: "Yo! I'm Qings and I'm an aspiring Teacher.",
                schoolYear: "4th Year",
                birthday: "2005-02-14",
                college: "BR. ANDREW GONZALEZ COLLEGE OF EDUCATION",
                course: "Secondary Education",
                profilePic: "https://upload.wikimedia.org/wikipedia/commons/2/27/CairoEgMuseumTaaMaskMostlyPhotographed.jpg",
                header: "https://www.deutschland.de/sites/default/files/styles/image_carousel_mobile/public/media/image/istock-486585530.jpg?itok=tlv-E2Fo"
            },
            {
                username: "clair",
                password: "1234",
                idNumber: "12524242",
                name: "Clair Enotrill",
                email: "big2026@gmail.com",
                bio: "What is up!!!!! I'm Clair and I'm an aspiring musician, but I'm currently taking Accounting",
                schoolYear: "1st Year",
                birthday: "2006-12-11",
                college: "RAMON V. DEL ROSARIO COLLEGE OF BUSINESS",
                course: "Accountancy",
                profilePic: "https://i.pinimg.com/736x/a3/5b/d7/a35bd72c588effdaa91c603a695f0821.jpg",
                header: "https://i.pinimg.com/1200x/7d/2a/56/7d2a5606c7b568636e87a468a2481901.jpg"
            },
        ]);

        await Laboratory.insertMany([
            {
                name: "Computer Lab A",
                room: "G305",
                capacity: 30,
                description: "30 different computers with RTX Graphics and i9 processors",
                status: "available",
                image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Contemporary_Computer_Lab.jpg",
            },
            {
                name: "Computer Lab B",
                room: "G304",
                capacity: 30,
                description: "30 different computers with RTX Graphics and i9 processors",
                status: "available",
                image: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Contemporary_Computer_Lab.jpg",
            },
            {
                name: "Chemistry Lab A",
                room: "V101",
                capacity: 30,
                description: "Equipped with enough laboratory equipment for 45 people",
                status: "available",
                image: "https://customfabricators.net/wp-content/uploads/2021/06/lab-countertop-selection.jpg",
            },
            {
                name: "Chemistry Lab B",
                room: "V102",
                capacity: 30,
                description: "Equipped with enough laboratory equipment for 45 people",
                status: "unavailable",
                image: "https://customfabricators.net/wp-content/uploads/2021/06/lab-countertop-selection.jpg",
            },
            {
                name: "Biology Lab A",
                room: "V105",
                capacity: 30,
                description: "Equipped with enough laboratory equipment for 45 people as well as live specimen ready for dissection.",
                status: "available",
                image: "https://biology.columbia.edu/sites/biology.columbia.edu/files/styles/cu_crop/public/content/New%20labs%20photo%20for%20website%20r.jpg?itok=ZGJY0ZQI",
            }
        ]);

        console.log("Database seeded successfully");
        mongoose.connection.close();
    }
    catch(err) {
        console.error(err);
    }
}

seedDB();
