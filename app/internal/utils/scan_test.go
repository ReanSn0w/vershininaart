package utils

import (
	"bytes"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_scanPageFiles(t *testing.T) {
	items, err := scanPageFiles("../../../content")
	require.NoError(t, err)
	assert.Greater(t, len(items), 0)
}

func Test_ScanPages(t *testing.T) {
	items, err := ScanPages("../../../content")
	require.NoError(t, err)
	assert.Greater(t, len(items), 0)
}

func Test_CopyStatic(t *testing.T) {

}

func Test_LoadTemplates(t *testing.T) {
	tmpl, err := LoadTemplates("../../../tmpl")
	require.NoError(t, err)
	require.NotNil(t, tmpl)

	cases := []struct {
		Name string
		Data Page
	}{
		{
			Name: "Bio Page",
			Data: Page{
				TMPL:  "page-bio",
				Title: "page title",
				Bio: struct {
					Image Image  "yaml:\"image\""
					Text  string "yaml:\"text\""
				}{
					Image: Image{
						Src: "test_src",
						Alt: "test alt text",
					},
					Text: "test bio text",
				},
			},
		},
		{
			Name: "CV Page",
			Data: Page{
				TMPL:  "page-cv",
				Title: "CV",
				CV: []struct {
					Title string "yaml:\"title\""
					Items []struct {
						Title       string "yaml:\"title\""
						Year        string "yaml:\"year\""
						Description string "yaml:\"description\""
					} "yaml:\"items\""
				}{
					{
						Title: "test title",
						Items: []struct {
							Title       string "yaml:\"title\""
							Year        string "yaml:\"year\""
							Description string "yaml:\"description\""
						}{
							{
								Title:       "Test",
								Year:        "2006",
								Description: "Description",
							},
						},
					},
				},
			},
		},
		{
			Name: "Contacts Page",
			Data: Page{
				TMPL:  "page-contacts",
				Title: "Контакты",
				Contacts: []struct {
					Title  string "yaml:\"title\""
					Value  string "yaml:\"value\""
					Link   string "yaml:\"link\""
					Custom string "yaml:\"custom\""
				}{
					{
						Title:  "Telegram",
						Value:  "value",
						Link:   "link",
						Custom: "custom",
					},
				},
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.Name, func(t *testing.T) {
			buf := new(bytes.Buffer)
			err := tmpl.ExecuteTemplate(buf, tc.Data.TMPL, tc.Data)
			assert.NoError(t, err)
			assert.True(t, buf.Len() > 0)
		})
	}
}
