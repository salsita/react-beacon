# react-beacon
---

React Beacon - Onboarding Tooltips using Slack-like Beacons

## Screenshots

<img src="https://raw.githubusercontent.com/salsita/react-beacon/master/assets/react-beacon.gif" width="600"/>

## Example

http://localhost:8017/examples

### Props

* `position`: top, right, bottom or left for tooltip to appear. Default to right
* `persistent`: see below

## Persistence

If the `persistent` attribute is specified, the component will automatically remember whether the beacon has been
clicked on. If it has already been clicked, it will not be displayed again since generally the user will only want
to see an onboarding tooltip once.

The state of each beacon is stored using a unique ID. If you just set `persistent` to `true`, a SHA-1 hash will
be calculated from the beacon content and used as the key. This means that all beacons will have a unique key as
long as they also have unique content. You can override this key by specifying some other truthy value for
the `persistent` attribute.

IndexedDB is used for storing the beacon state, so if some of your target browsers don't support IndexedDB,
you should use a [shim](https://github.com/axemclion/IndexedDBShim).

## Development

```
npm install
npm start
```

## License

react-beacon is released under the MIT license.
