export function createScrollHandler({ fetchDown, fetchUp = null, scrollMargin = 150 }) {
    let isFetchingDown = false;
    let isFetchingUp = false;
    let lastScrollTop = 0; // keeps track of last scroll position
    let direction = null;  // "up" | "down" | null

    // Internal function that can run in "dry run" mode
    function checkPosition(el, { dryRun = false } = {}) {
        if (!el) return;

        const currentScrollTop = el.scrollTop;

        // Detect direction
        if (currentScrollTop > lastScrollTop) {
            direction = "down";
        } else if (currentScrollTop < lastScrollTop) {
            direction = "up";
        }

        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // prevent negative

        if (
            fetchDown &&
            el.scrollTop + el.clientHeight >= el.scrollHeight - scrollMargin &&
            !isFetchingDown &&
            !isFetchingUp &&
            direction === "down"
        ) {
            if (!dryRun) {
                isFetchingDown = true;
                fetchDown().finally(() => {
                    isFetchingDown = false;
                });
            }
        }

        if (
            fetchUp &&
            el.scrollTop <= scrollMargin &&
            !isFetchingDown &&
            !isFetchingUp &&
            direction === "up"
        ) {
            if (!dryRun) {
                isFetchingUp = true;
                fetchUp().finally(() => {
                    isFetchingUp = false;
                });
            }
        }
    }

    // The function to attach to the scroll event
    function handler(e) {
        const el = e.target === document ? document.documentElement : e.target;
        checkPosition(el);
    }

    return { handler, checkPosition, getDirection: () => direction };
}

