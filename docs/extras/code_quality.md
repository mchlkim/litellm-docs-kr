# Code Quality

🚅 LiteLLM follows the [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html).

We run: 
- Ruff for [formatting and linting checks](https://github.com/BerriAI/litellm/blob/e19bb55e3b4c6a858b6e364302ebbf6633a51de5/.circleci/config.yml#L320)
- Mypy + Pyright for typing [1](https://github.com/BerriAI/litellm/blob/e19bb55e3b4c6a858b6e364302ebbf6633a51de5/.circleci/config.yml#L90), [2](https://github.com/BerriAI/litellm/blob/e19bb55e3b4c6a858b6e364302ebbf6633a51de5/.pre-commit-config.yaml#L4)
- Black for [formatting](https://github.com/BerriAI/litellm/blob/e19bb55e3b4c6a858b6e364302ebbf6633a51de5/.circleci/config.yml#L79)
- isort for [import sorting](https://github.com/BerriAI/litellm/blob/e19bb55e3b4c6a858b6e364302ebbf6633a51de5/.pre-commit-config.yaml#L10)


코드 품질을 개선할 제안이 있다면 issue나 PR을 열어 주세요.
