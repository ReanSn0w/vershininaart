package build

import (
	"bytes"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"
	"webtool/internal/utils"
)

func BuildTemplates(tmpl *template.Template, pages []utils.Page, contentDir, publicDir string) error {
	err := os.MkdirAll(publicDir, 0744)
	if err != nil {
		return err
	}

	var (
		indexPage   utils.Page
		seriesPages = make([]utils.Page, 0)
	)

	for _, page := range pages {
		if page.TMPL == "page-index" {
			indexPage = page
			continue
		}

		if page.TMPL == "page-series" {
			seriesPages = append(seriesPages, page)
		}

		targetLocation := strings.TrimPrefix(page.FileLocation, contentDir)

		err := buildPageTemplate(tmpl, page, publicDir+filepath.Dir(targetLocation)+"/index.html")
		if err != nil {
			return err
		}
	}

	indexPage = packByCollection(indexPage, seriesPages)

	err = buildPageTemplate(tmpl, indexPage, publicDir+"/index.html")
	if err != nil {
		return err
	}

	return nil
}

func buildPageTemplate(tmpl *template.Template, page utils.Page, location string) error {
	buf := new(bytes.Buffer)

	locDir := filepath.Dir(location)
	err := os.MkdirAll(locDir, 0744)
	if err != nil {
		return fmt.Errorf("make location %s dir err: %w", locDir, err)
	}

	err = tmpl.ExecuteTemplate(buf, page.TMPL, page)
	if err != nil {
		return fmt.Errorf("build page %s err: %w", location, err)
	}

	f, err := os.Create(location)
	if err != nil {
		return fmt.Errorf("create file %s err: %w", location, err)
	}

	defer f.Close()

	_, err = buf.WriteTo(f)
	if err != nil {
		return fmt.Errorf("write file %s err: %w", location, err)
	}

	return nil
}

type Collections map[string][]utils.Page

func packByCollection(index utils.Page, pages []utils.Page) utils.Page {
	for i, c := range index.Index {
		for _, p := range pages {
			if p.Collection == c.Tag {
				continue
			}

			index.Index[i].Sub = append(index.Index[i].Sub, p)
		}
	}

	return index
}
