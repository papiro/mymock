# Header-driven mock server with proxying
## mymock.js
---
*Key Features*
+ Toggle headers on/off for on-the-fly fine-grained control over which endpoints get mocked and which pass through to the live service.
+ Any requests which aren't being mocked are forwarded by mymock (which acts as a proxy) to the live service and the response is, of course, hand-delivered back to your page by mymock.
+ Live response data editing without restarting the mymock server!
---

There's little use for mymock in a home/personal development environment where you're writing all your own services anyways, but boy does it come in handy when doing development at work!

In a rapidly fluctuating environment where back-end developers are doing hourly deploys, actively making changes, breaking then fixing the live services, coming to ask you to test something one second and then advising you to use your mocks the next second - something like mymock is a LIFESAVER.

mymock works in tandem with a request header modification plugin such as [Requestly](https://chrome.google.com/webstore/detail/requestly/mdnleldcmiljblolnjhpnblkcekpdkpa) or [Modify Headers](https://chrome.google.com/webstore/detail/modify-headers-for-google/innpjfdalfhpcoinfnehdnbkglpmogdi?hl=en-US) or (for Firefox) [Modify Headers](https://addons.mozilla.org/en-US/firefox/addon/modify-headers/).  For IE, it seems like the only solution is a desktop application such as Fiddler.

After installing your header-mod tool of choice, you can add a header for every call you might want to mock, and a separate header for any calls you might want to intentionally fail (for failure handling development).

Example:
Add the headers "mockDetails" and "mockDetails-fail" with any value (mymock only tests for existence of the header)

Your mymock-config.json would look something like:
```
{
  "liveServer": {
    "hostname": "serviceUnderDevelopment.com",
    "port": 86759
  },
  "mockServer": {
    "listeningPort": 8080,
    "dataDir": "./mymock-data",
    "definitions": [
      {
        "request": {
          "header": "mockDetails",
          "path": "/path/to/details/resource",
          "method": "GET"
        },
        "response": {
          "data": "details.json",
          "status": 200
        },
        "fail": {
          "response": {
            "status": 500
          }
        }
      }
    ]
  }
}

```

Add your response data mocks into a directory of your choice ("mymock-data" in the example above), start the server `node mymock` and voilà!  Toggle away :)
