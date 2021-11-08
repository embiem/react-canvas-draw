# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2021-11-08

### Fixed

- Pan & Zoom feature now actually works. 1.2.0 introduced the big refactor by markbiddlecom, but also lots of other PRs that were merged, which caused a regression.

## [1.2.0] - 2021-11-08

### Added

- Support for refreshing the background image
- Grid customization props (grid size, line width & hide axis)
- Export drawing to file/dataUrl using new `getDataURL` function
- Panning & Zooming

### Changed

- z-index no longer hard-coded, allowing overlayed CanvasDraw components
- big refactor, kudos to @markbiddlecom for this mammoth task
- allow React 17 as peer dependency

## [1.1.1] - 2020-04-27

### Added

- Started this CHANGELOG.md file to keep track of any changes per version

### Fixed

- Fix touch draw issue. (<https://github.com/embiem/react-canvas-draw/issues/29>)
- Fix "Can't draw dots" issue. (<https://github.com/embiem/react-canvas-draw/issues/42>)
- Fix image not shown due to cache. (<https://github.com/embiem/react-canvas-draw/issues/59>)
- Fix image issues on canvas resize. (<https://github.com/embiem/react-canvas-draw/issues/66>)
- Fix SecurityError on save. (<https://github.com/embiem/react-canvas-draw/issues/70>)

### Changed

- Unified touch & mouse events to streamline core draw logic (handleDrawStart, handleDrawMove & handleDrawEnd)

## [1.1.0] - 2019-12-29

### Added

- onChange prop #50 (<https://github.com/embiem/react-canvas-draw/pull/50>)

### Fixed

- Fix "Immediate flag should be really immediate" issue #30 (<https://github.com/embiem/react-canvas-draw/issues/30>)
