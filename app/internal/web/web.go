package web

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-pkgz/lgr"
)

func New(log lgr.L, contentDir string) *Server {
	return &Server{log: log, contentDir: contentDir}
}

type Server struct {
	contentDir string
	log        lgr.L
}

func (s *Server) Run(port int) error {
	srv := http.Server{
		Addr: fmt.Sprintf(":%d", port),
	}

	srv.Handler = s.handler()

	return srv.ListenAndServe()
}

func (s *Server) handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lgr.Default().Logf("[INFO] url path: %s", r.URL.Path)
		path := s.contentDir + r.URL.Path
		lgr.Default().Logf("[DEBUG] file path: %s", path)

		fi, err := os.Stat(path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		if !fi.IsDir() {
			http.ServeFile(w, r, path)
		} else {
			http.ServeFile(w, r, path+"/index.html")
		}
	})
}
