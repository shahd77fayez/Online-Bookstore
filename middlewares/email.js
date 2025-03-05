export const createHtml = (type,Text) => {
    let title = "";
    let message = Text;

    if (type === "confirmation") {
        title = "Email Confirmation";
    } else if (type === "reset") {
        title = "Password Reset";
    } else if (type === "notification") {
        title = "Notification";
    } else {
        title = "Message from GreenWave";
    }
    return `<!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
                    <style type="text/css">
                        body {
                            background: linear-gradient(to right, #32a852, #88bdbf);
                            margin: 0;
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            width: 50%;
                            margin: auto;
                            padding: 30px;
                            background-color: #F3F3F3;
                            border: 1px solid #2E8B57;
                            border-radius: 10px;
                        }
                        .header {
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                        }
                        .header img {
                            width: 100px;
                        }
                        .content {
                            text-align: center;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 10px;
                        }
                        .content h1 {
                            padding-top: 25px;
                            color: #2E8B57;
                        }
                        .content p {
                            padding: 0 100px;
                            color: #555;
                        }
                        .content .message {
                            margin: 10px 0 30px 0;
                            border-radius: 4px;
                            padding: 10px 20px;
                            color: #fff;
                            background-color: #2E8B57;
                        }
                        .footer {
                            text-align: center;
                            border-radius: 5px;
                            padding-top: 10px;
                        }
                        .footer h3 {
                            margin-top: 10px;
                            color: #000;
                        }
                        .social-icons a {
                            text-decoration: none;
                            margin: 0 5px;
                        }
                        .social-icons img {
                            width: 50px;
                            height: 50px;
                            border-radius: 50%;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1><img src="https://res.cloudinary.com/dqvaypijl/image/upload/v1720843471/Logo_ay3dsl.jpg" alt="GreenWave Logo" /></h1>
                        </div>
                        <div class="content">
                            <div style="background-color: #2E8B57; height: 100px; font-size: 50px; color: #fff;">
                                <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png" alt="Icon" style="width: 50px; height: 50px; margin-top: 25px;">
                            </div>
                            <h1>${title}</h1>
                            <p class="message">${message}</p>
                        </div>
                    </div>
                </body>
                </html>`;
};
import nodemailer from 'nodemailer';

async function sendEmail ({to,subject,html,attachments = []}={}){
    if (!to) {
        console.error("No recipient email provided!");
        throw new Error("No recipient email provided");
    }
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{

            user:process.env.EMAIL,
            pass:process.env.EMAIL_PASSWORD,
        },

    });

    let info = await transporter.sendMail({
        from :`"Green Wave" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
        attachments
    });

    return info.rejected.length ?false : true
    
}

export default sendEmail