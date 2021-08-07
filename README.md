
# improv-wifi-mod
This is a ble wifi onboarding package for working in the [Moddable SDK](https://www.moddable.com/). This attempts to maintain the same interface we know from [improv-wifi](https://improv-wifi.com/).

## Installation
`git clone https://github.com/dashcraft/improv-wifi-mod.git` or `git clone git@github.com:dashcraft/improv-wifi-mod.git`
`cd improv-wifi-mod && yarn install`
`yarn build`

Copy the `/improv-wifi-mod` folder into your moddable sdk project,
then add the improv-wifi-mod package to your projects manifest.json includes:

`"./improv-wifi-mod/manifest.json"`

## Usage
First import the primary package
`import  Improv  from  'improv-wifi-mod'`
