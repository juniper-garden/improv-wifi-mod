
# improv-wifi-mod
This is a ble wifi onboarding package for working in the [Moddable SDK](https://www.moddable.com/). This attempts to maintain the same interface we know from [improv-wifi](https://improv-wifi.com/).

## Installation
`git clone https://github.com/dashcraft/improv-wifi-mod.git` or `git clone git@github.com:dashcraft/improv-wifi-mod.git`
`cd improv-wifi-mod && yarn install`
`yarn build`

Copy the `/improv-wifi-mod` folder into your moddable sdk project,
then add the improv-wifi-mod package to your projects manifest.json includes:

`"./improv-wifi-mod/manifest.json"`

as well as including in the root manifest...
```
  "ble":{
		"*": [
			"./improv-wifi-mod/bleservices/*"
		]
	}
```

A full example is included as `example-manifest.json`
## Usage
Import the file and instantiate an instance of ImprovWifi

i.e.

```
import ImprovWifi from "improv-wifi-mod";

let server = new ImprovWifi({
  deviceName: "Moddable-Test",
  onCredentialsRecieved: someHandleCredsFunction
});

function someHandleCredsFunction ({ ssid, password }) {
  // Handle the credentials here
}
```

