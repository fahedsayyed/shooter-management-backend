//src\utils\emailBody.ts

require("dotenv").config();

export const adminInviteRegister = (fullName: any, associatedWith: any) => {
  console.log(process.env.SUPER_ADMIN_SERVER_HOST, "path");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Shooter Management!</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f0f0f0; color: #333; margin: 0; padding: 0;">
  <div class="container" style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;">
    <h2 style="color: #007bff; margin-top: 0;">Welcome to Shooter Management!</h2>
    <h3 style="color: #007bff; margin-top: 10px;"> Hello ${fullName} </h3>
    <p style="margin-bottom: 20px;">We are excited to welcome you to Shooter Management! STS has invited you to join as the administrator for ${fullName}. To get started, please click on the following link to complete your registration:</p>
    <p style="text-align: center;"><a href="${process.env.SUPER_ADMIN_SERVER_HOST}/super-admin/create/${associatedWith}" class="button" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Register Now</a></p>
    <p>We're excited to have you on board!</p>
  </div>
  <p class="footer" style="text-align: center; margin-top: 20px; color: #666;">© 2024 Shooter Management. All rights reserved.</p>
</body>
</html>
`;
};

export const updateStatusBody = (
  fullName: any,
  emailSubject: any,
  status: any,
  tenantType: any,
  name: any,
  in_active_reason: any
) => {
  const inlineStyles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #ccc; /* Border properties */
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      overflow: hidden;
    }
    h2 {
      color: #dc3545;
    }
    p {
      color: #555;
      margin-bottom: 10px;
      font-size: 16px; /* Adjust font size */
      font-weight: bold; /* Make font bold */
    }
    .reason {
      font-weight: bold;
    }
    .highlight {
      background-color: yellow; /* Highlight color */
      font-weight: bold; /* Make font bold */
    }
    .footer {
      margin-top: 20px;
      color: #666;
    }
  </style>
`;

  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${emailSubject}</title>
      ${inlineStyles}
    </head>
    <body>
      <div class="container">
        <h2>Administrator Invitation Rejection</h2>
        <p>We regret to inform you that your invitation to join Shooter Management as an administrator for 
          <span class="highlight">${fullName}</span> ${tenantType} 
          <span class="highlight">${name}</span> has been 
          <span class="highlight">${status}</span> by STS.</p>
        ${
          in_active_reason
            ? `<div class="reason"><p>The reason for rejection is:</p><p style="color: red;">${in_active_reason}</p></div>`
            : ""
        }
        <p>We appreciate your interest in joining us and apologize for any inconvenience caused.</p>
        <div class="footer">&copy; ${new Date().getFullYear()} Shooter Management. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
  return emailBody;
};

export const paymentEmailBody = (
  fullNameTitleCase: any,
  amount: any,
  paymentUrl: any
) => {
  const emailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Complete Your Registration: Payment Required</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
      margin: 0;
      padding: 0;
    }
    .card {
      max-width: 700px; /* Increased width of the card */
      margin: 20px auto;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      padding: 30px; /* Increased padding */
      border: 1px solid #ddd;
    }
    .container {
      text-align: left;
    }
    h2 {
      color: #333;
    }
    p {
      color: #555;
      margin-bottom: 20px;
      line-height: 1.6;
      font-size: 16px;
      font-weight: bold;
    }
    a {
      color: #007bff;
      text-decoration: underline;
      transition: color 0.3s ease;
    }
    a:hover {
      color: #0056b3;
    }
    .signature {
      margin-top: 20px;
      font-style: italic;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="container">
      <h2>Dear ${fullNameTitleCase},</h2>
      <p>Thank you for choosing us! We are delighted to welcome you aboard.</p>
      <p>To complete your registration and unlock the full benefits of our services, we kindly ask you to proceed with the payment by clicking <a href="${paymentUrl}">here</a>.</p>
      <p>Upon receipt of your payment, your registration will be confirmed, granting you access to all features and resources available to our valued customers.</p>
      <p>If you have any questions or require assistance, please don't hesitate to reach out to our customer support team at <a href="mailto:sayyed.fahed@stspl.com">sayyed.fahed@stspl.com</a> or call us at 82683888380.</p>
      <p>We sincerely appreciate your prompt attention to this matter and eagerly anticipate serving you.</p>
      <div class="signature">
        <p>Best regards,</p>
        <p>Sayyed Fahed</p>
      </div>
    </div>
  </div>
</body>
</html>

  `;
  return emailBody;
};

export const generateApprovedEmailBody = (
  fullName: any,
  emailSubject: any,
  status: any,
  tenantType: any,
  name: any,
  email: any,
  generatedPassword: any,
  token: any
) => {
  const inlineStyles = `
    <style>
      /* Add your CSS styles here */
    </style>
  `;

  const emailBody = `
  <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Welcome to Our Platform!</title>
        </head>
        <body>
          <h2>Welcome to shooter Management, ${fullName} </h2>
          <p>Thank you for registering with us.</p>
          <p>Here are your login details:</p>
          <p>
            <strong>Email:</strong> ${email}<br>
            <strong>Password:</strong> ${generatedPassword}
          </p>
          <p>
            Please use this password along with the following link to set up a new password:
            Your temporary password: ${generatedPassword}. Please use this password along with the following link to set up a new password
            <a href="https://sm.taolabs.in:4443/super-admin/auth/update-password?token=${token}" target="_blank" rel="noopener noreferrer">Reset Password</a>
          </p>
          <p>We're excited to have you on board!</p>
        </body>
        </html>
  `;

  return emailBody;
};

export const gettingApprovedAnotherTImes = (email: any) => {
  const emailBody = `
    Hello ${email},

    You've been approved again! We apologize for any inconvenience caused during the disapproval process. 
    You can now log in with your previous credentials and access our services.

    Thank you for your patience and understanding.

    Regards,
    [SYNERGY TECHNOLOGIES SERVICES PRIVATE LIMITED]
  `;
  return emailBody;
};

// export const adminInvoiceBody = (txnid: any, amount: any) => {
//   const emailBody = `
//   <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Invoice</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #F4F4F4;">
//         <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//             <tr>
//                 <td colspan="2" style="text-align: center; margin-bottom: 20px;">
//                     <img src="img/STS logo.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 10px;">
//                     <h2>Thank You for Your Business!</h2>
//                 </td>
//             </tr>
//             <tr>
//                 <td style="width: 50%; vertical-align: top;">
//                     <h3>Address:</h3>
//                     <p>STS</p>
//                     <p>A 303/304, Citi Point, A K Road, J B Nagar, Andheri (East)</p>
//                     <p>Mumbai, Mumbai Suburban,Pincode: 400 059</p>
//                 </td>
//                 <td style="width: 50%; vertical-align: top;">
//                     <h3>Recipient's Address:</h3>
//                     <p>Recipient's Company Name</p>
//                     <p>Recipient's Company Address</p>
//                     <p>City, State, Zip</p>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2" style="margin-bottom: 20px;">
//                     <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
//                         <tr>
//                             <td>
//                                 <b>Txnid:</b> ${txnid}
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Invoice Number:</b> INV-123456
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Issued Date:</b> March 6, 2024
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Due Date:</b> March 20, 2024
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Total Paid Amount:</b> ${amount}
//                             </td>
//                         </tr>
//                     </table>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2">
//                     <table style="width: 100%; border-collapse: collapse;">
//                         <thead>
//                             <tr>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Description</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Qty</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Unit Price</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Total</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">Product/Service 1</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">1</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$100.00</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$100.00</td>
//                             </tr>
//                             <tr>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">Product/Service 2</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">2</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$200.00</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$400.00</td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2" style="margin-top: 20px; font-size: 14px; text-align: center;">
//                     <p>If you have any questions regarding this invoice, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>
//                     <p>Thank you for your business!</p>
//                 </td>
//             </tr>
//         </table>
//     </body>
//     </html>
//   `;

//   return emailBody;
// }

// export const adminInvoiceBody = (
//   txnid: any,
//   amount: any,
//   recipientName: string,
//   recipientAddress: string,
//   recipientCity: string,
//   recipientState: string,
//   recipientPincode: string,
//   productInfo: string
// ) => {
//   const emailBody = `
//   <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Invoice</title>
//     </head>
//     <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #F4F4F4;">
//         <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
//             <tr>
//                 <td colspan="2" style="text-align: center; margin-bottom: 20px;">
//                     <img src="../../public/img/STS logo.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 10px;">
//                     <h2>Thank You for Your Business!</h2>
//                 </td>
//             </tr>
//             <tr>
//                 <td style="width: 50%; vertical-align: top;">
//                     <h3>Address:</h3>
//                     <p>STS</p>
//                     <p>A 303/304, Citi Point, A K Road, J B Nagar, Andheri (East)</p>
//                     <p>Mumbai, Mumbai Suburban, Pincode: 400 059</p>
//                 </td>
//                 <td style="width: 50%; vertical-align: top;">
//                     <h3>Recipient's Address:</h3>
//                     <p>${recipientName}</p>
//                     <p>${recipientAddress}</p>
//                     <p>${recipientCity}, ${recipientState}, ${recipientPincode}</p>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2" style="margin-bottom: 20px;">
//                     <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
//                         <tr>
//                             <td>
//                                 <b>Txnid:</b> ${txnid}
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Invoice Number:</b> INV-123456
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Issued Date:</b> March 6, 2024
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Due Date:</b> March 20, 2024
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Total Paid Amount:</b> ${amount}
//                             </td>
//                         </tr>
//                         <tr>
//                             <td>
//                                 <b>Product Information:</b> ${productInfo}
//                             </td>
//                         </tr>
//                     </table>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2">
//                     <table style="width: 100%; border-collapse: collapse;">
//                         <thead>
//                             <tr>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Description</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Qty</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Unit Price</th>
//                                 <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Total</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">Product/Service 1</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">1</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$100.00</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$100.00</td>
//                             </tr>
//                             <tr>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">Product/Service 2</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">2</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$200.00</td>
//                                 <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">$400.00</td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </td>
//             </tr>
//             <tr>
//                 <td colspan="2" style="margin-top: 20px; font-size: 14px; text-align: center;">
//                     <p>If you have any questions regarding this invoice, please contact us at <a href="mailto:info@yourcompany.com">info@yourcompany.com</a>.</p>
//                     <p>Thank you for your business!</p>
//                 </td>
//             </tr>
//         </table>
//     </body>
//     </html>
//   `;

//   return emailBody;
// };

export const adminInvoiceBody = (
  txnid: any,
  amount: any,
  recipientName: string,
  recipientAddress: string,
  recipientCity: string,
  recipientState: string,
  recipientPincode: string,
  productInfo: string,
  planName: any,
  duration: any
) => {
  const currentDate = new Date();
  let dueDate = new Date();
  switch (duration) {
    case "1 month":
      dueDate.setMonth(currentDate.getMonth() + 1);
      break;
    case "3 months":
      dueDate.setMonth(currentDate.getMonth() + 3);
      break;
    case "6 months":
      dueDate.setMonth(currentDate.getMonth() + 6);
      break;
    case "annually":
      dueDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    case "lifetime":
      // Set a distant date for lifetime subscription
      dueDate = new Date("2100-01-01");
      break;
    default:
      break;
  }

  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #F4F4F4;">
        <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <tr>
                <td colspan="2" style="text-align: center; margin-bottom: 20px;">
                    <img src="https://res.cloudinary.com/dqukxcjfk/image/upload/v1710840402/rftf6ehthjwmekx3adua.png" alt="Company Logo" style="max-width: 150px; margin-bottom: 10px;">
                    <h2>Thank You for Your Business!</h2>
                </td>
            </tr>
          <tr>
           <td style="width: 50%; vertical-align: top; text-align: left;">
            <h3>Address:</h3>
            Synergy Technology Services,<br>
           A 303/304, Citi Point, A K Road,<br>
            J B Nagar, Andheri (East),<br>
           Mumbai Suburban,Pincode: 400 059.
         </td>
       <td style="width: 50%; vertical-align: top; text-align: right;">
         <h3>Recipient's Address:</h3>
           ${recipientName},<br>
          ${recipientAddress},<br>
           ${recipientCity}, ${recipientState},<br>
            Pincode: ${recipientPincode}.
        </td>
       </tr>
        <tr style="height: 20px;"></tr> 
        <tr>
          <td colspan="2" style="padding-bottom: 20px;">
            <h3 style="margin-bottom: 5px;">Payment for:</h3>
            ${productInfo}
          </td>
        </tr>
         <tr>
          <td colspan="2" style="margin-bottom: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td>
                  <b>Txnid:</b> ${txnid}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Issued Date:</b> ${currentDate.toDateString()}
                </td>
              </tr>
              <tr>
                <td>
                  <b>Due Date:</b> ${dueDate.toDateString()}
                </td>
              </tr>
            </table>
          </td>
        </tr>
         <tr style="height: 20px;"></tr> 
        <tr>
          <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Plan Name</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Duration</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left; background-color: #F2F2F2;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${planName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${duration}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${amount}</td>
        </tr>
        <tr>
          <td colspan="2" style="margin-top: 20px; font-size: 14px; text-align: center;">
            <p>If you have any questions regarding this invoice, please contact us at <a href="mailto:sayyed.fahed@stspl.com">sayyed.fahed@stspl.com</a>.</p>
            <p>Thank you for your business!</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return emailBody;
};

export const shooterRegistrationBody = ({firstname, status, txnid, amount, card_type, error, bank_ref_num, productinfo}: any) => {

  const emailBody = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Payment Success</title>
  </head>
  <body>
    <h2>Payment Successful</h2>
    <p>Thank you for your payment. Below are the details of your transaction:</p>
    <ul>
    <li><strong>First Name:</strong> ${firstname}</li>
      <li><strong>Status:</strong> ${status}</li>
      <li><strong>Transaction ID:</strong> ${txnid}</li>
    <li><strong>Amount:</strong> ${amount}</li>
    
      <li><strong>Card Type:</strong> ${card_type}</li>
      <li><strong>Message:</strong> ${error}</li>
    
  
      <li><strong>Bank Reference Number:</strong> ${bank_ref_num}</li>
      <li><strong>Product Info:</strong> ${productinfo}</li>

    </ul>
    <p>We have sent a copy of this information to your registered email address.</p>
  </body>
  </html>
`;


  return emailBody
}
export const generateResetPasswordEmailBody = (
  firstName: any,
  lastName: any,
  userEmail: any,
  generatedPassword: any,
  token: any
) => {
  const inlineStyles = `
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                margin: 0;
                padding: 0;
            }
            h2 {
                color: #333;
            }
            p {
                color: #555;
                margin-bottom: 20px;
                line-height: 1.6;
                font-size: 16px;
            }
            strong {
                font-weight: bold;
            }
            a {
                color: #007bff;
                text-decoration: none;
                border-bottom: 1px solid #007bff;
                transition: color 0.3s ease;
            }
            a:hover {
                color: #0056b3;
            }
        </style>
    `;

  const emailBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Welcome to Our Platform!</title>
            ${inlineStyles}
        </head>
        <body>
            <h2>Welcome, ${firstName} ${lastName}</h2>
            <p>Thank you for registering with us.</p>
            <p>Here are your login details:</p>
            <p>
                <strong>Email:</strong> ${userEmail}<br>
                <strong>Password:</strong> ${generatedPassword}
            </p>
            <p>
                Please use this password along with the following link to set up a new password:
                <a href=${process.env.SERVER_HOST}/auth/update-password?token=${token} target="_blank" rel="noopener noreferrer">Reset Password</a>
            </p>
            <p>We're excited to have you on board!</p>
        </body>
        </html>
    `;

  return emailBody;
};
