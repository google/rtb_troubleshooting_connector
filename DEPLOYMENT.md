# Deploying the RTB Troubleshooting Connector

This page provides step-by-step instructions for deploying your own personal instance of the connector for use in Data Studio. Generally, you will only need to perform these steps once.

## Sign In to Google Account

You need a Google account to set up and use the connector. Sign in to the Google
account you use to access the Authorized Buyers or Open Bidding UI.

## Create a Google Cloud Project

1.  Go to https://console.cloud.google.com
1.  Review the [Google Cloud Platform Terms of Service],
    [Google APIs Terms of Service], and
    [Ad Exchange API and Protocol Terms of Service], and any other documents
    indicated by the dialog. If you agree to them, check the box and click
    **AGREE AND CONTINUE**.
1.  Click **Select a project.**
1.  In the dialog that appears, click **NEW PROJECT**.
1.  If desired, set a specific project name and ID (or leave the auto-generated
    ones). Then click **CREATE**.

[Google Cloud Platform Terms of Service]: https://cloud.google.com/terms/
[Google APIs Terms of Service]: https://console.cloud.google.com/tos?id=universal
[Ad Exchange API and Protocol Terms of Service]: https://console.cloud.google.com/tos?id=adexchange

## Enable APIs

1.  In the Google Cloud Console with your project selected, open the side menu
    and click **APIs & Services** > **Library**.
1.  Type **Ad Exchange Buyer API II** in the search box.
1.  Click the **Ad Exchange Buyer API II** search
    result, click to open the page with API details, and click **Enable**.
1.  Repeat the above steps, substituting **Real-time Bidding API** for **Ad
    Exchange Buyer API II**.

## Configure OAuth Consent Screen

1.  In the Google Cloud Console with your project selected, open the side menu
    and click **APIs & Services** > **OAuth consent screen**.
1.  Select **External** and click **CREATE**.
1.  Enter `RTB Troubleshooting Connector` (or whatever you wish your instance to
    be called) in the **App name** box.
1.  Select your email address in the **User support email** dropdown menu.
1.  Enter your email address under **Developer contact information**.
1.  Click **SAVE AND CONTINUE**.
1.  Click **ADD OR REMOVE SCOPES**.
1.  In the **Update selected scopes** screen under **Manually add scopes**,
    enter each of the following scopes, clicking **ADD TO TABLE** after each
    scope. Then click **UPDATE**.
    -   https://www.googleapis.com/auth/adexchange.buyer
    -   https://www.googleapis.com/auth/realtime-bidding
    -   https://www.googleapis.com/auth/script.external_request
    -   https://www.googleapis.com/auth/userinfo.email
1.  Click **SAVE AND CONTINUE**.
1.  Click **SAVE AND CONTINUE**.

## Note Cloud Project Number

1.  In the Google Cloud Console with your project selected, open the side menu
    and click **IAM & Admin** > **Settings**.
1.  Take note of the value in the **Project number** box, as you will need it
    later.

## Copy Code to Google Apps Script

1.  Go to https://script.google.com and click **New project**.
1.  In the Google Apps Script development environment, click **Project
    Settings** (the gear icon).
1.  Under **General settings**, check the box next to *Show "appsscript.json"
    manifest file in editor*.
1.  Under **Google Cloud Platform (GCP) Project**, click **Change project**.
1.  Enter the project number you noted earlier in the **GCP project number** box
    and click **Set project**.
1.  Click **Editor** (the `<>` icon) to return to the editor.
1.  Click `appsscript.json` in the sidebar to open that file for editing.
1.  Copy the contents of `src/appsscript.json` from this repository and paste
    them into the `appsscript.json` file in the Google Apps Script editor.
1.  For each `js` file in the `src` directory (you can ignore the `tests`
    directory for the purposes of this guide), create a corresponding `gs` file
    in the Google Apps Script editor. Then, copy the contents of the `js` file
    to your clipboard and paste them into the corresponding `gs` file. It's
    probably best to use the same filename (e.g., paste the contents of
    `src/my_file.js` into a file called `my_file.gs`), but strictly speaking the
    filenames need not match as long as you copy over all the code.
1.  Delete the `Code.gs` file that was created by default in the Google Apps
    Script editor. If you don't see it, then no action is required.

## Deploy the Connector

1.  In the Google Apps Script development environment, click **Deploy** > **New
    deployment**.
1.  In the **New description** box, type a name for your deployment (e.g.,
    "Initial deployment") and then click **Deploy**.
1.  Take note of the Deployment ID, as you will need it later.

## Authorize the Connector

1.  Go to
    `https://datastudio.google.com/datasources/create?connectorId=$DEPLOYMENT_ID`,
    replacing `$DEPLOYMENT_ID` with the Deployment ID from the last section.
1.  Click **AUTHORIZE**.
1.  Select your Google account from the dialog.
1.  At the *Google hasn’t verified this app* screen, click **Continue**.
1.  At the *RTB Troubleshooting Connector wants to access your Google Account*
    screen, click **Allow**.

## Done

Congratulations! Your instance of the RTB Troubleshooting Connector is now
deployed and ready to use. You can use it to create one or more [Data Sources],
which in turn can be used to create one or more [Reports] or [Explorers].

Since you have authorized the connector, it will remain available in the
[connector list] for easy access unless you [revoke access]. Alternatively, you
can use the same URL
(`https://datastudio.google.com/datasources/create?connectorId=$DEPLOYMENT_ID`)
to create Data Sources from your instance of the connector.

[Data Sources]: https://support.google.com/datastudio/answer/6268208?hl=en
[Reports]: https://support.google.com/datastudio/answer/6309867?hl=en
[Explorers]: https://support.google.com/datastudio/answer/9005651?hl=en
[connector list]: https://datastudio.google.com/c/datasources/create
[revoke access]: https://support.google.com/datastudio/answer/9053467
