# Deployment Guide for Success Sprout

## Prerequisites

1. AWS Account Setup:
   - Create an AWS account if you don't have one
   - Install AWS CLI: https://aws.amazon.com/cli/
   - Install EB CLI: `pip install awsebcli`

2. PayPal Business Account:
   - Create a PayPal Business account: https://www.paypal.com/business
   - Get your Live API credentials from the PayPal Developer Dashboard

3. MongoDB Atlas Setup:
   - Create a MongoDB Atlas account
   - Set up a new cluster
   - Get your connection string

## Configuration Steps

1. PayPal Integration:
   ```bash
   # Get your PayPal API credentials from PayPal Developer Dashboard
   Live Client ID: Your_Live_Client_ID
   Live Secret Key: Your_Live_Secret_Key
   ```

2. Update config.json:
   - Replace `YOUR_MONGODB_ATLAS_URI` with your MongoDB Atlas connection string
   - Replace `YOUR_LIVE_PAYPAL_CLIENT_ID` with your PayPal Live Client ID
   - Replace `YOUR_LIVE_PAYPAL_CLIENT_SECRET` with your PayPal Live Secret Key

3. AWS Elastic Beanstalk Setup:
   ```bash
   # Initialize EB CLI in your project
   eb init

   # Create a new environment
   eb create SuccessSprout-env

   # Set environment variables
   eb setenv NODE_ENV=production \
            MONGODB_URI=your_mongodb_atlas_uri \
            PAYPAL_CLIENT_ID=your_paypal_client_id \
            PAYPAL_CLIENT_SECRET=your_paypal_client_secret \
            JWT_SECRET=your_jwt_secret
   ```

## Deployment Steps

1. Prepare for deployment:
   ```bash
   # Install dependencies
   npm install

   # Test locally
   npm start
   ```

2. Deploy to AWS:
   ```bash
   # Deploy your application
   eb deploy
   ```

3. Verify deployment:
   ```bash
   # Check application health
   eb status
   
   # View application logs
   eb logs
   ```

## Post-Deployment Verification

1. Test PayPal Integration:
   - Make a test purchase
   - Verify payment is processed
   - Check MongoDB for payment record

2. Monitor Application:
   - Set up AWS CloudWatch alerts
   - Monitor error rates
   - Check application logs

## Important Security Notes

1. Never commit sensitive information to version control:
   - PayPal API credentials
   - MongoDB connection strings
   - JWT secrets

2. Ensure SSL/TLS is enabled:
   - Configure HTTPS in Elastic Beanstalk
   - Use secure MongoDB connection string

3. Regular Maintenance:
   - Keep dependencies updated
   - Monitor security advisories
   - Backup database regularly

## Troubleshooting

1. If MongoDB connection fails:
   - Verify network access in MongoDB Atlas
   - Check connection string
   - Verify IP whitelist

2. If PayPal integration fails:
   - Verify API credentials
   - Check PayPal dashboard for errors
   - Verify webhook configurations

3. If AWS deployment fails:
   - Check eb-activity.log
   - Verify environment variables
   - Check instance permissions

## Contact Support

For additional support:
- AWS Support: https://aws.amazon.com/support
- PayPal Developer Support: https://developer.paypal.com/support
- MongoDB Atlas Support: https://support.mongodb.com