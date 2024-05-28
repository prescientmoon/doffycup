{
  description = "Doffycup";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        lib = pkgs.lib;
        nodejs = pkgs.nodejs_18;
      in
      rec {
        packages.doffycup = pkgs.buildNpmPackage.override
          { stdenv = pkgs.stdenvNoCC; }
          {
            name = "doffycup";

            buildInputs = [ nodejs pkgs.gzip ];

            src = lib.cleanSource ./.;
            npmDepsHash = builtins.readFile ./npm-deps-hash;

            ESBUILD_BASEURL = "";

            postBuild = ''
              # Github pages requires an additional 404.html file
              cp dist/{index,404}.html

              # -k = keeps the original files in place
              # -r = recursive
              # -9 = best compression
              gzip -kr9 dist
            '';

            installPhase = ''
              mkdir $out
              cp -r dist $out/www
            '';
          };

        packages.doffycup-github-pages = packages.doffycup;

        packages.default = packages.doffycup;
        devShells.default = pkgs.mkShell {
          packages = [ nodejs ];
        };

        apps.compute-npm-dep-hash = {
          type = "app";
          program = pkgs.lib.getExe (pkgs.writeShellApplication {
            name = "compute-npm-dep-hash";
            runtimeInputs = [ pkgs.prefetch-npm-deps ];
            text = "prefetch-npm-deps ./package-lock.json > ./npm-deps-hash";
          });
        };
      }
    );
}

