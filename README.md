# react-beacon
---

React Beacon - Onboarding Tooltips using Slack-like Beacons

## Screenshots

<img src="https://raw.githubusercontent.com/salsita/react-beacon/master/assets/react-beacon.gif" width="600"/>

## Example

http://localhost:8080/

### Props

`<BeaconConfig persistent />`

* `persistent`: see below

`<Beacon tooltipText="Hey!" inline />`

* `tooltipText`: content for the tooltip
* `align`: preference for tooltip alignment, accepts an array of horizontal/vertical options, ex: `['left', 'top']` in that order. If not set, the alignment is selected automatically based on viewport bounds
* `inline`: by default [Tether](http://tether.io/) library is used to handle positioning, which may perform poorly in some cases. This option allows you to position the Beacons inline inside their immediate parent instead. See below for details

## Usage

Just place the `Beacon` tag around the target element with the tooltip text as its attribute:

```JSX
<BeaconConfig persistent>
  <Beacon tooltipText="And you did!">
    <h1>Highlight me!</h1>
  </Beacon>
</BeaconConfig>
```

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

## Inline positioning
If Beacons are set to inline positioning, both the beaconed elements and the beacon visual itself are placed in `inline-beacon` parent element that you may have to restyle for your layout. The resulting HTML structure of the component looks as follows where both the beacon and the tooltip become a sibling to your wrapped content and are positioned absolutely inside this parent

```JSX
<inline-beacon>
  {this.props.children}
  {tooltipActive ? <tour-beacon/> : <tour-tooltip/>}
</inline-beacon>
```

The pulsating beacon is always centered relative to this parent and while the triggered tooltip position accepts alignment options, it may be needed to adjust the tooltip CSS position manually to your usecase as there is no offscreen detection that is otherwise provided by Tether. In an ideal case, the `inline-beacon` should be the same size as the target element, barely wrapping it.

## Tooltip Overlay effect

If desired, the tooltip target can be highlighted by fading the application HTML context and enlarging the target when
the beacon is clicked (see screenshot). To activate this functionality, add the class `tour-overlay` to
your application root element (i.e. the element that should be faded). This feature does not work with the inline option, because the target cannot escape its stacking context

## Development

```
npm install
npm start
```

## License

react-beacon is released under the MIT license.
