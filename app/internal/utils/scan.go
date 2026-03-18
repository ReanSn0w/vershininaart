package utils

import (
	"fmt"
	"html/template"
	"io"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

func CopyStatic(fromDir, toDir string) error {
	err := os.MkdirAll(toDir, 0744)
	if err != nil {
		return err
	}

	entries, err := os.ReadDir(fromDir)
	if err != nil {
		return fmt.Errorf("read dir %s entries: %w", fromDir, err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			err := CopyStatic(fromDir+"/"+entry.Name(), toDir+"/"+entry.Name())
			if err != nil {
				return err
			}

			continue
		}

		fromFile, err := os.Open(fromDir + "/" + entry.Name())
		if err != nil {
			return fmt.Errorf("open fromFile %s err: %w", fromDir+"/"+entry.Name(), err)
		}

		targetFile, err := os.Create(toDir + "/" + entry.Name())
		if err != nil {
			return fmt.Errorf("open toFile %s err: %w", toDir+"/"+entry.Name(), err)
		}

		_, err = io.Copy(targetFile, fromFile)
		if err != nil {
			return fmt.Errorf("copyfile %s err: %w", toDir+"/"+entry.Name(), err)
		}

		fromFile.Close()
		targetFile.Close()
	}

	return nil
}

func LoadTemplates(path string) (*template.Template, error) {
	tmpl := template.New("ssg")

	tmpl = tmpl.Funcs(template.FuncMap{
		"add": func(a, b int) int {
			return a + b
		},
	})

	tmpl, err := tmpl.ParseGlob(path + "/*.html")
	if err != nil {
		return nil, err
	}

	return tmpl, nil
}

func ScanPages(path string) ([]Page, error) {
	files, err := scanPageFiles(path)
	if err != nil {
		return nil, err
	}

	var result []Page

	for _, file := range files {
		if err := func() error {
			f, err := os.Open(file)
			if err != nil {
				return err
			}

			defer f.Close()

			var page Page
			err = yaml.NewDecoder(f).Decode(&page)
			if err != nil {
				return err
			}

			page.FileLocation = file
			page.PlainPath = strings.TrimSuffix(strings.TrimPrefix(file, path), "/content.yml")

			if page.Bio.Image.Src != "" {
				page.Bio.Image.Src = filepath.Dir(file) + "/" + page.Bio.Image.Src
			}

			for i := range page.Works {
				if page.Works[i].Image.Src != "" {
					page.Works[i].Image.Src = filepath.Dir(file) + "/" + page.Works[i].Image.Src
				}
			}

			result = append(result, page)
			return nil
		}(); err != nil {
			return nil, err
		}
	}

	return result, nil
}

func scanPageFiles(path string) ([]string, error) {
	result := []string{}

	items, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	for _, item := range items {
		if item.IsDir() {
			files, err := scanPageFiles(path + "/" + item.Name())
			if err != nil {
				return nil, err
			}

			result = append(result, files...)
		} else {
			if item.Name() == "content.yml" {
				result = append(result, path+"/"+item.Name())
			}
		}
	}

	return result, nil
}
