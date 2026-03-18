package main

import (
	"os"
	"webtool/internal/build"
	"webtool/internal/utils"
	"webtool/internal/web"

	"github.com/ReanSn0w/gokit/pkg/app"
)

var (
	revision = "debug"

	opts = struct {
		app.Debug

		Action struct {
			Build bool `long:"build" description:"Build static site"`
			Run   bool `long:"run" dewscription:"Run web server"`
		} `group:"Application Actions"`

		Server struct {
			Port int `long:"port" env:"PORT" default:"8080" description:"server port"`
		} `group:"HTTP Server" namespace:"server" env-namespace:"SERVER"`

		Image struct {
			ThumbWidth int `long:"thumb" default:"400" description:"thumb max width"`
		} `group:"Image Settings" namespace:"image"`

		Dir struct {
			Content string `long:"content" default:"./content" description:"content data location"`
			Static  string `long:"static" default:"./static" description:"static content location"`
			Public  string `long:"public" env:"PUBLIC" default:"./public" description:"public data location"`
			TMPL    string `long:"tmpl" default:"./tmpl" description:"tmpl dir location"`
		} `group:"Directory Locations" namespace:"dir" env-namespace:"DIR"`
	}{}
)

func main() {
	app := app.New("Vershinina Art SSG", revision, &opts)
	action := selectAction()

	switch action {
	case ActionBuild:
		app.Log().Logf("[INFO] selected action: build")

		tmpl, err := utils.LoadTemplates(opts.Dir.TMPL)
		if err != nil {
			app.Log().Logf("[ERROR] parse templates err: %w", err)
			os.Exit(2)
		}

		err = utils.CopyStatic(opts.Dir.Static, opts.Dir.Public)
		if err != nil {
			app.Log().Logf("[ERROR] copy static err: %w", err)
			os.Exit(2)
		}

		pages, err := utils.ScanPages(opts.Dir.Content)
		if err != nil {
			app.Log().Logf("[ERROR] scan content err: %w", err)
			os.Exit(2)
		}

		if len(pages) == 0 {
			app.Log().Logf("[ERROR] no pages found")
			os.Exit(2)
		}

		err = build.PrepareImages(pages, opts.Dir.Public, opts.Image.ThumbWidth)
		if err != nil {
			app.Log().Logf("[ERROR] build images err: %w", err)
			os.Exit(2)
		}

		err = build.BuildTemplates(tmpl, pages, opts.Dir.Content, opts.Dir.Public)
		if err != nil {
			app.Log().Logf("[ERROR] build templates err: %w", err)
			os.Exit(2)
		}
	case ActionRun:
		app.Log().Logf("[INFO] selected action: run")

		srv := web.New(app.Log(), opts.Dir.Public)
		if err := srv.Run(opts.Server.Port); err != nil {
			app.Log().Logf("[ERROR] start web server err: %s", err)
		}
	default:
		app.Log().Logf("[ERROR] no selected action")
		os.Exit(2)
	}

	app.Log().Logf("[INFO] job done!")
}

const (
	ActionUnknown Action = iota
	ActionBuild
	ActionRun
)

type Action byte

func selectAction() Action {
	if opts.Action.Build {
		return ActionBuild
	}

	if opts.Action.Run {
		return ActionRun
	}

	return ActionUnknown
}
