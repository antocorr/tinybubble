import { describe, expect, it } from "vitest";
import { createComponent } from "../../src/index.js";
import { flushMicrotasks } from "../setup/test-helpers.js";

describe("reactivity nested loops", () => {
  it("renders nested x-for loops and updates after reassignment", async () => {
    const App = {
      template() {
        return `
          <div>
            <button id="add-card" @click="addCard">Add card</button>
            <section class="board" x-for="board in boards">
              <h2 class="board-title">{{ board.title }}</h2>
              <article class="list" x-for="list in board.lists">
                <h3 class="list-title">{{ list.title }}</h3>
                <ul>
                  <li class="card" x-for="card in list.cards">{{ card }}</li>
                </ul>
              </article>
            </section>
          </div>
        `;
      },
      data() {
        return {
          boards: [
            {
              title: "Roadmap",
              lists: [
                { title: "Todo", cards: ["Card 1", "Card 2"] },
                { title: "Doing", cards: ["Card 1"] },
              ],
            },
            {
              title: "Bugs",
              lists: [{ title: "Done", cards: ["Card 1"] }],
            },
          ],
        };
      },
      addCard() {
        const nextBoards = this.data.boards.value.map((board, boardIndex) => {
          if (boardIndex !== 0) return board;
          return {
            ...board,
            lists: board.lists.map((list, listIndex) => {
              if (listIndex !== 0) return list;
              return {
                ...list,
                cards: [...list.cards, `Card ${list.cards.length + 1}`],
              };
            }),
          };
        });
        this.data.boards.value = nextBoards;
      },
    };

    const host = document.createElement("div");
    document.body.appendChild(host);

    const app = createComponent(App);
    app.appendTo(host);

    expect(host.querySelectorAll(".board")).toHaveLength(2);
    expect(host.querySelectorAll(".list")).toHaveLength(3);
    expect(host.querySelectorAll(".card")).toHaveLength(4);

    host.querySelector("#add-card").click();
    await flushMicrotasks();

    const cards = [...host.querySelectorAll(".card")].map((el) => el.textContent.trim());
    expect(cards).toHaveLength(5);
    expect(cards).toContain("Card 3");
  });
});
